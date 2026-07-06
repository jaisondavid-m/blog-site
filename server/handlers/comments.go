package handlers

import (

	"strings"
	"net/http"
	"database/sql"

	"server/config"
	"server/models"
	"server/helper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

)


func GetComments(c *gin.Context) {

	uuidParam := c.Param("uuid")

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
			cm.parent_comment_id, cm.comment_text, cm.likes_count, cm.created_at
		FROM blog_comments cm
		JOIN users u ON u.id = cm.user_id
		WHERE cm.post_id = ? AND cm.deleted_at IS NULL
		ORDER BY cm.created_at ASC
	`, postID)

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

		if err := rows.Scan(
			&cm.ID, &cm.UUID, &cm.PostID, &cm.UserID, &cm.AuthorName, &lastName, &avatar,
			&parentID, &cm.CommentText, &cm.LikesCount, &cm.CreatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read comments",
			})
			return
		}

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

		err := config.DB.QueryRow("SELECT post_id FROM blog_comments WHERE id = ? AND deleted_at IS NULL", *in.ParentCommentID).Scan(*&parentPostID)

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
		})
		return
	}

	res, err := tx.Exec(`
		INSERT INTO blog_comments (uuid, post_id, user_id, parent_comment_id, comment_text)
		VALUES (?, ?, ?, ?)
	`, commentUUID, postID, userID, in.ParentCommentID, in.CommentText)

	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to creatte comment",
		})
		return
	}

	if _, err := tx.Exec("UDPATE blog_posts SET comments_count = comments_countt + 1 WHERE id = ?", postID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create comment",
		})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create comment", 
		})
		return 
	}

	id, _ := res.LastInsertId()

	c.JSON(http.StatusCreated, gin.H{
		"id": id,
		"uuid": commentUUID,
	})

}