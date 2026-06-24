package handlers

import (
	"database/sql"
	"net/http"
	// "strconv"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/helper"
	// "server/models"
)

func ToggleBookmark(c *gin.Context) {

	userID, _ := helper.GetUserID(c)
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

	var exists bool

	config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM blog_bookmarks WHERE post_id = ? AND user_id = ?)", postID, userID).Scan(&exists)

	if exists {
		if _, err := config.DB.Exec("DELETE FROM blog_bookmarks WHERE post_id = ? AND user_id = ?", postID, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to remove bookmark",
			})
			return
		} else {
			if _, err := config.DB.Exec("INSERT INTO blog_bookmarks (post_id, userid) VALUES (?, ?)",postID, userID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to add add bookmark",
				})
				return
			}
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"bookmarked": !exists,
	})
}