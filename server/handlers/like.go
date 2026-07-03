package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/helper"
)

func ToggleLike(c *gin.Context) {

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

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to toggle like",
		})
	}

	defer tx.Rollback()

	res, err := tx.Exec(
		"INSERT IGNORE INTO blog_likes (post_id, user_id) VALUES (?, ?)",
		postID, userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to toggle like",
		})
		return
	}

	rows, _ := res.RowsAffected()
	liked := rows > 0

	if liked {
		if _, err := tx.Exec("UPDATE blog_posts SET likes_count = likes_count + 1 WHERE id = ?", postID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to toggle like",
			})
			return 
		}
	} else {
		if _, err := tx.Exec("DELETE FROM blog_likes WHERE post_id = ? AND user_id = ?", postID, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to toggle like",
			})
			return
		}
		if _, err := tx.Exec("UDPATE blog_posts SET likes_count = likes_count - 1 WHERE id = ?", postID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to toggle like",
			})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to toggle like",
		})
		return
	}

	// var exists bool
	// config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM blog_likes WHERE post_id = ? AND user_id = ?)", postID, userID).Scan(&exists)

	// tx, err := config.DB.Begin()
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{
	// 		"error": "Failed to toggle like",
	// 	})
	// 	return
	// }

	// if exists {
	// 	tx.Exec("DELETE FROM blog_likes WHERE post_id = ? AND user_id = ?", postID, userID)
	// 	tx.Exec("UPDATE blog_posts SET likes_count = like_count - 1 WHERE id = ?", postID)
	// } else {
	// 	tx.Exec("INSERT INTO blog_likes (post_id, user_id) VALUES (?, ?)", postID, userID)
	// 	tx.Exec("UPDATE blog_posts SET likes_count = likes_count + 1 WHERE id = ?", postID)
	// }

	// if err := tx.Commit(); err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{
	// 		"error": "Failed to toggle like",
	// 	})
	// 	return
	// }

	var likesCount uint
	config.DB.QueryRow("SELECT likes_count FROM blog_posts WHERE id = ?", postID).Scan(&likesCount)

	c.JSON(http.StatusOK, gin.H{
		"liked": liked,
		"likes_count": likesCount,
	})

}