package handlers

import (

	// "strconv"
	"net/http"
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"server/config"
	"server/helper"
	"server/models"

)

var validReportReasons = map[string]bool{
	"spam": true,
	"harassment": true,
	"hate_speech": true,
	"misinformation": true,
	"nudity": true,
	"violence": true,
	"other": true,
}

func ReportPost(c *gin.Context) {

	userID, _ := helper.GetUserID(c)
	uuidParam := c.Param("uuid")

	var in models.ReportPostInput

	if err := c.ShouldBindJSON(&in); err != nil || !validReportReasons[in.Reason] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "A valid reason is required",
		})
		return
	}

	var postID, authorID uint64

	err := config.DB.QueryRow(
		"SELECT id, author_id FROM blog_posts WHERE uuid = ? AND deleted_at IS NULL", uuidParam,
	).Scan(&postID, &authorID)

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

	if authorID == userID {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "You cannot report your own post",
		})
		return
	}

	var existingID uint64

	err = config.DB.QueryRow(
		"SELECT id FROM blog_post_reports WHERE post_id = ? AND reporter_id = ?", postID, userID,
	).Scan(&existingID)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "You have already reported this post",
		})
		return
	}

	if err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to check existing report",
		})
		return
	}

	reportUUID := uuid.NewString()

	if _, err := config.DB.Exec(
		"INSERT INTO blog_post_reports (uuid, post_id, reporter_id, reason, description) VALUES (?, ?, ?, ?, ?)",
		reportUUID, postID, userID, in.Reason, in.Description,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to report post",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Post reported successfully",
		"uuid": reportUUID,
	})

}