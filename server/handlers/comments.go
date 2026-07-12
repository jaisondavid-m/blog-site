package handlers

import (
	"database/sql"
	"net/http"
	"strings"

	"server/config"
	"server/helper"
	"server/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)


func GetComments(c *gin.Context) {

	uuidParam := c.Param("uuid")

	userID, _ := helper.GetUserID(c)

	sortParam := c.DefaultQuery("sort", "newest")

	orderBy := "cm.created_at ASC"

	if sortParam == "newest" {
		orderBy = "cm.created_at DESC"
	}

	var postID uint64

	err := config.DB.QueryRow("SELECT id FROM blog_posts WHERE uuid = ? AND deleted_at IS NULL", uuidParam).Scan(&postID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Post not found",
		})
		return 
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch post",
		})
		return 
	}

	rows, err := config.DB.Query(`
		SELECT
			cm.id, cm.uuid, cm.post_id, cm.user_id, u.first_name, u.last_name, u.avatar_url,
			cm.parent_comment_id, cm.comment_text, cm.likes_count, cm.created_at,
			EXISTS(
				SELECT 1 FROM blog_comment_likes bcl
				WHERE bcl.comment_id = cm.id AND bcl.user_id = ?
			) AS liked
			FROM blog_comments cm
			JOIN users u ON u.id = cm.user_id
			WHERE cm.post_id = ? AND cm.deleted_at IS NULL
			ORDER BY `+orderBy+`
	`, userID, postID)

	// rows, err := config.DB.Query(`
	// 	SELECT
	// 		cm.id, cm.uuid, cm.post_id, cm.user_id, u.first_name, u.last_name, u.avatar_url,
	// 		cm.parent_comment_id, cm.comment_text, cm.likes_count, cm.created_at
	// 	FROM blog_comments cm
	// 	JOIN users u ON u.id = cm.user_id
	// 	WHERE cm.post_id = ? AND cm.deleted_at IS NULL
	// 	ORDER BY cm.created_at ASC
	// `, postID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch comments",
		})
		return 

	}

	defer rows.Close()

	var all []*models.Comment
	byID := map[uint64]*models.Comment{}

	for rows.Next() {

		var cm models.Comment
		var lastName, avatar sql.NullString
		var parentID sql.NullInt64
		var likedInt int

		if err := rows.Scan(
			&cm.ID, &cm.UUID, &cm.PostID, &cm.UserID, &cm.AuthorName, &lastName, &avatar,
			&parentID, &cm.CommentText, &cm.LikesCount, &cm.CreatedAt, &likedInt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read comments",
			})
			return
		}

		cm.Liked = likedInt != 0

		if lastName.Valid {
			cm.AuthorName += " " + lastName.String
		}

		cm.AuthorAvatar = avatar.String

		if parentID.Valid {
			pid := uint64(parentID.Int64)
			cm.ParentCommentID = &pid
		}

		cm.Replies = []*models.Comment{}

		all = append(all, &cm)
		byID[cm.ID] = &cm

	}

	var roots []*models.Comment

	for _, cm := range all {
		if cm.ParentCommentID == nil {
			roots = append(roots, cm)
		} else if parent, ok := byID[*cm.ParentCommentID]; ok {
			parent.Replies = append(parent.Replies, cm)
		}
	}

	if roots == nil {
		roots = []*models.Comment{}
	}

	c.JSON(http.StatusOK, gin.H{
		"comments": roots,
	})

}

func CreateComment(c *gin.Context) {

	userID, _ := helper.GetUserID(c)
	uuidParam := c.Param("uuid")

	var in models.CreateCommentInput

	if err := c.ShouldBindJSON(&in); err != nil || strings.TrimSpace(in.CommentText) == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Comment text is required",
		})
		return
	}

	var postID uint64

	err := config.DB.QueryRow("SELECT id FROM blog_posts WHERE uuid = ? AND deleted_at IS NULL", uuidParam).Scan(&postID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Post not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch post",
		})
		return
	}

	if in.ParentCommentID != nil {

		var parentPostID uint64

		err := config.DB.QueryRow("SELECT post_id FROM blog_comments WHERE id = ? AND deleted_at IS NULL", *in.ParentCommentID).Scan(&parentPostID)

		if err == sql.ErrNoRows || (err == nil && parentPostID != postID) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid parent comment",
			})
			return
		}

		if err != nil && err != sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to validate parent comment",
			})
			return
		}
	}

	commentUUID := uuid.NewString()

	tx, err := config.DB.Begin()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create comment",
			"err":1,
		})
		return
	}

	res, err := tx.Exec(`
		INSERT INTO blog_comments (uuid, post_id, user_id, parent_comment_id, comment_text)
		VALUES (?, ?, ?, ?, ?)
	`, commentUUID, postID, userID, in.ParentCommentID, in.CommentText)

	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create comment",
			"err":2,
		})
		return
	}

	if _, err := tx.Exec("UPDATE blog_posts SET comments_count = comments_count + 1 WHERE id = ?", postID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create comment",
			"err":3,
		})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create comment", 
			"err":4,
		})
		return 
	}

	id, _ := res.LastInsertId()
	commentID := uint64(id)

	go NotifyMentions(in.CommentText, userID, &postID, &commentID,  "mention_comment")

	c.JSON(http.StatusCreated, gin.H{
		"id": id,
		"uuid": commentUUID,
	})

}

func UpdateComment(c *gin.Context) {

	userID, _ := helper.GetUserID(c)
	uuidParam := c.Param("uuid")

	var in models.UpdateCommentInput

	if err := c.ShouldBindJSON(&in);err != nil || strings.TrimSpace(in.CommentText) == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Comment text is required",
		})
		return 
	}

	var ownerID, postID uint64

	err := config.DB.QueryRow("SELECT user_id, post_id FROM blog_comments WHERE uuid = ? AND deleted_at IS NULL", uuidParam).Scan(&ownerID, &postID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Comment not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch comment",
		})
		return
	}

	if ownerID != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You can only edit your own comments",
		})
		return
	}

	var commentID uint64

	if err := config.DB.QueryRow(
		"SELECT id FROM blog_comments WHERE uuid = ? AND deleted_at IS NULL", uuidParam,
	).Scan(&commentID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch comment",
		})
		return	
	}

	if _, err := config.DB.Exec("UPDATE blog_comments SET comment_text = ? WHERE uuid = ?", in.CommentText, uuidParam); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Failed to update comment",
		})
		return 
	}

	go NotifyMentions(in.CommentText, userID, &postID, &commentID, "mention_comment")

	c.JSON(http.StatusOK, gin.H{
		"message": "Comments updated",
	})

}

func DeleteComment(c *gin.Context) {

	userID, _ := helper.GetUserID(c)
	uuidParam := c.Param("uuid")

	var commentID, ownerID, postID uint64

	err := config.DB.QueryRow("SELECT id, user_id, post_id FROM blog_comments WHERE uuid = ? AND deleted_at IS NULL", uuidParam).
		Scan(&commentID ,&ownerID, &postID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Comment not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch comment",
		})
		return
	}

	var postAuthorID uint64

	if err := config.DB.QueryRow("SELECT author_id FROM blog_posts WHERE id = ?", postID).Scan(&postAuthorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch post",
		})
		return
	}

	if ownerID != userID && postAuthorID != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You can only delete your own comments",
		})
		return
	}

	tx, err := config.DB.Begin()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete comment",
		})
		return
	}

	rows, err := tx.Query(`
		WITH RECURSIVE descendants AS (
			SELECT id FROM blog_comments WHERE id = ? AND deleted_at IS NULL
			UNION ALL
			SELECT bc.id
			FROM blog_comments bc
			INNER JOIN descendants d ON bc.parent_comment_id = d.id
			WHERE bc.deleted_at IS NULL
		)
		SELECT id FROM descendants
	`, commentID)

	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete comment",
		})
		return
	}

	var ids []uint64

	for rows.Next() {
		var id uint64
		if err := rows.Scan(&id); err != nil {
			rows.Close()
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to delete comment",
			})
			return
		}
		ids = append(ids, id)
	}
	rows.Close()

	if len(ids) == 0 {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Comment not found",
		})
		return
	}

	placeholders := strings.TrimSuffix(strings.Repeat("?,", len(ids)), ",")

	args := make([]interface{}, len(ids))

	for i, id := range ids {
		args[i] = id
	}

	if _, err := tx.Exec(
		"UPDATE blog_comments SET deleted_at = NOW() WHERE id IN ("+placeholders+")",
		args...,
	); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete comment",
		})
		return
	}

	if _, err := tx.Exec(
		"UPDATE blog_posts SET comments_count = comments_count - ? WHERE id = ?",
		len(ids), postID,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete comment",
		})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete comment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Comment deleted",
	})

}

func ToggleCommentLike(c *gin.Context) {

	userID, _ := helper.GetUserID(c)
	uuidParam := c.Param("uuid")

	var commentID uint64

	err := config.DB.QueryRow("SELECT id FROM blog_comments WHERE uuid = ? AND deleted_at IS NULL", uuidParam).Scan(&commentID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Comment not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch comment",
		})
		return
	}

	tx, err := config.DB.Begin()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to toggle like",
		})
		return
	}

	var existingID uint64

	err = tx.QueryRow("SELECT id FROM blog_comment_likes WHERE comment_id = ? AND user_id = ?", commentID, userID).Scan(&existingID)

	var liked bool

	if err == sql.ErrNoRows {

		if _, err := tx.Exec("INSERT INTO blog_comment_likes (comment_id, user_id) VALUES (?, ?)", commentID, userID); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to like comment",
			})
			return
		}

		if _, err := tx.Exec("UPDATE blog_comments SET likes_count = likes_count + 1 WHERE id = ?", commentID); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to like comment",
			})
			return
		}

		liked = true

	} else if err != nil {

		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to toggle like",
		})

		return

	} else {

		if _, err := tx.Exec("DELETE FROM blog_comment_likes WHERE comment_id = ? AND user_id = ?", commentID, userID); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to unlike comment",
			})
			return
		}

		if _, err := tx.Exec("UPDATE blog_comments SET likes_count = likes_count - 1 WHERE id = ?", commentID); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to unlike comment",
			})
			return
		}

		liked = false

	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to toggle like",
		})
		return
	}

	var likesCount uint

	config.DB.QueryRow("SELECT likes_count FROM blog_comments WHERE id = ?", commentID).Scan(&likesCount)

	c.JSON(http.StatusOK, gin.H{
		"liked": liked,
		"likes_count": likesCount,
	})

}