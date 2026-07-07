package handlers

import (

	"fmt"
	"net/http"

	"server/config"
	"server/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	
)

func GuestLogin(c *gin.Context) {

	guestUUID := uuid.New().String()
	shortID := guestUUID[:8]

	username := fmt.Sprintf("guest_%s", shortID)
	email := fmt.Sprintf("guest_%s@guest.local", shortID)

	randomSecret := uuid.New().String()

	hashedPassword, err := utils.HashPassword(randomSecret)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create guest session",
		})
		return
	}

	query := `
	INSERT INTO users (
		uuid,
		first_name,
		last_name,
		username,
		email,
		password_hash,
		is_guest,
		email_verified
	)
	VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)
	`

	result, err := config.DB.Exec(
		query,
		guestUUID,
		"Guest",
		"",
		username,
		email,
		hashedPassword,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create guest account",
		})
		return
	}

	id, err := result.LastInsertId()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create guest session",
		})
		return
	}

	token, err := utils.GenerateToken(uint64(id))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create session",
		})
		return
	}

	c.SetCookie(
		"auth_token",
		token,
		3*60*60,
		"/",
		"",
		false,
		true,
	)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Signed in as guest",
		"user": gin.H{
			"id": id,
			"uuid": guestUUID,
			"username": username,
			"is_guest": true,
		},
	})

}