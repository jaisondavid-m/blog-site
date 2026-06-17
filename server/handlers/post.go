package handlers

import (
	"fmt"
	"strconv"
	"time"

	// "strings"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"server/config"
	"server/helper"
	"server/models"
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

func GetPosts(c *gin.Context) {

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if limit < 1 || limit > 50 {
		limit = 10
	}

	offset := (page - 1) * limit

	tag := c.Query("tag")
	userID, authed := helper.GetUserID(c)

	args := []any{}
	query := `
		SELECT
			p.id, p.uuid, p.author_id, u.first_name, u.last_name, u.avatar_url,
			p.title, p.excerpt, p.tag, p.cover_image, p.views_count,
			p.likes_count, p.comments_count, p.published_at, p.created_at,
	`

	if authed {
		query += `
			EXISTS(SELECT 1 FROM blog_likes b1 WHERE b1.post_id = p.id AND b1.user_id = ?) AS is_liked,
			EXISTS(SELECT 1 FROM blog_bookmarks b2 WHERE b2.post_id = p.id AND b2.user_id = ?) AS is_bookmarked
		`
		args = append(args, userID, userID)
	} else {
		query += `0 AS is_liked, 0 AS is_bookmarked`
	}

	query += `
		FROM blog_posts p
		JOIN users u on u.id = p.author_id
		WHERE p.status = 'published' AND p.deleted_at IS NULL
	`

	if tag != "" {
		query += " AND p.tag = ?"
		args = append(args, tag)
	}

	// query += "ORDER BY p.published_at DESC LIMIT ? OFFSET ?"
	query += "ORDER BY p.published_at DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)

	fmt.Println(query)
	fmt.Println(args)
	rows, err := config.DB.Query(query, args...)

	if err != nil {
		println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			// "error":"Failed to fetch posts",
			"error":err.Error(),
			"query":query,
		})
		return
	}

	defer rows.Close()

	posts := []models.Post{}

	for rows.Next() {

		var p models.Post
		var lastName, avatar, excerpt, tagVal, cover sql.NullString
		var publishedAt sql.NullTime

		if err := rows.Scan(
			&p.ID, &p.UUID, &p.AuthorID, &p.AuthorName, &lastName, &avatar,
			&p.Title, &excerpt, &tagVal, &cover, &p.ViewsCount,
			&p.LikesCount, &p.CommentCount, &publishedAt, &p.CreatedAt,
			&p.IsLiked, &p.IsBookmarked,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":"Failed to read posts",
			})
			return
		}

		if lastName.Valid {
			p.AuthorName += " " + lastName.String
		}

		p.AuthorAvatar = avatar.String
		p.Excerpt = excerpt.String
		p.Tag = tagVal.String
		p.CoverImage = cover.String

		if publishedAt.Valid {
			p.PublishedAt = &publishedAt.Time
		}

		posts = append(posts, p)

	}


	c.JSON(http.StatusOK, gin.H{
		"posts":posts,
		"page": page,
		"limit": limit,
	})

}