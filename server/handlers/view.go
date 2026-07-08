package handlers

import (

	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/models"

)

func GetUserProfile(c *gin.Context) {

	username := strings.TrimSpace(c.Param("username"))

	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username is required",
		})
		return
	}

	var profile models.PublicProfile
	var accountStatus string

	err := config.DB.QueryRow(
		`SELECT id, uuid, first_name, last_name, username, avatar_url, created_at, account_status
		FROM users
		WHERE username = ? AND deleted_at IS NULL`,
		username,
	).Scan(
		&profile.ID,
		&profile.UUID,
		&profile.FirstName,
		&profile.LastName,
		&profile.Username,
		&profile.AvatarURL,
		&profile.CreatedAt,
		&accountStatus,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch profile",
		})
		return
	}

	if accountStatus != "active" {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	err = config.DB.QueryRow(
		`SELECT COUNT(*) FROM blog_posts
		WHERE author_id = ? AND status = 'published' AND deleted_at IS NULL`,
		profile.ID,
	).Scan(&profile.PostsCount)

	if err != nil {
		profile.PostsCount = 0
	}

	if uid, exists := c.Get("user_id"); exists {
		if requestID, ok := uid.(uint64); ok && requestID == profile.ID {
			profile.IsOwner = true
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"profile": profile,
	})

}