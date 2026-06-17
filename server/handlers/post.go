package handlers

import (

	"time"
	// "strconv"
	// "strings"
	"net/http"
	// "database/sql"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"server/config"
	"server/models"
	"server/helper"

)

func CreatePost(c *gin.Context) {

	userID, _ := helper.GetUserID(c)

	var input models.CreatePostInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Title and content are required",
		})
		return
	}

	status := "draft"

	var publishedAt any

	if input.Status == "published" {
		status = "published"
		publishedAt = time.Now()
	}

	postUUID := uuid.NewString()

	res, err := config.DB.Exec(`
		INSERT INTO blog_posts (uuid, author_id, title, excerpt, content, tag, cover_image, status, published_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,postUUID, userID, input.Title, input.Excerpt, input.Content, input.Tag, input.CoverImage, status, publishedAt,
	)

	if err != nil {
		println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Failed to create post",
		})
		return
	}

	id, _ := res.LastInsertId()

	c.JSON(http.StatusCreated, gin.H{
		"message":"Post Created Successfully",
		"id":id,
		"uuid":postUUID,
	})

}