package handlers

import (
	"database/sql"
	"net/http"
	"server/config"

	"github.com/gin-gonic/gin"
)

func EmailVerificationStatus(c *gin.Context) {

	userID := c.MustGet("user_id").(uint64)

	var email string
	var emailVerified bool

	err := config.DB.QueryRow(
		`SELECT email,email_verified
		FROM users
		WHERE id = ?`,
		userID,
	).Scan(&emailVerified)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound,gin.H{
			"error":"User not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Database error",
		})
		return
	}

	c.JSON(http.StatusOK,gin.H{
		"email":email,
		"email_verified":emailVerified,
	})

}