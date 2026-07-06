package handlers

import (

	"strings"
	"net/http"
	"database/sql"

	"server/config"
	"server/models"

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