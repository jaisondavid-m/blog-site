package handlers

import (

	"fmt"
	"os"
	"path/filepath"
	"strings"

	"database/sql"
	"net/http"
	"server/config"

	"github.com/gin-gonic/gin"
)

func UpdateProfile(c *gin.Context) {

	userID := c.MustGet("user_id").(uint64)

	var input struct {
		FirstName 	string 		`json:"first_name"`
		LastName 	string	 	`json:"last_name"`
		Username 	string		`json:"username"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid input",
		})
		return
	}

	if input.FirstName == "" || input.LastName == "" || input.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"All fields are required",
		})
		return
	}

	var existingID uint64
	err := config.DB.QueryRow(
		"SELECT id FROM users WHERE username = ? AND id != ?",
		input.Username, userID,
	).Scan(&existingID)

	if err != sql.ErrNoRows {
		c.JSON(http.StatusConflict,gin.H{
			"error":"Username already exists",
		})
		return
	}

	_, err = config.DB.Exec(
		"UPDATE users SET first_name = ?, last_name = ?, username = ? WHERE id = ?",
		input.FirstName, input.LastName, input.Username, userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Failed to update profile",
		})
		return
	}

	c.JSON(http.StatusOK,gin.H{
		"message":"Profile Updated Successfully",
	})

}

func UploadAvatar(c *gin.Context) {

	userID := c.MustGet("user_id").(uint64)

	file, err := c.FormFile("avatar")

	if err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"No File uploaded",
		})
		return
	}

	// Validate size (2mb max)
	if file.Size > 2<<20 {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"File too large (max 2MB)",
		})
		return
	}

	//validate type
	ext := strings.ToLower(filepath.Ext(file.Filename))

	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png":true, ".webp": true}

	if !allowed[ext] {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Only JPG, PNG, WEBP allowed",
		})
		return
	}

	// Save to /uploads/avatars/<userID><ext?
	avatarDir := "./uploads/avatars"
	if err := os.MkdirAll(avatarDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Storage error",
		})
		return
	}

	filename := fmt.Sprintf("%d%s",userID,ext)

	savePath := filepath.Join(avatarDir,filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to save File",
		})
		return
	}

	avatarURL := fmt.Sprintf("/uploads/avatars/%s",filename)

	_, err = config.DB.Exec(
		"UPDATE users SET avatar_url = ? WHERE id = ?",
		avatarURL, userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to update avatar",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"avatar_url":avatarURL,
	})

}