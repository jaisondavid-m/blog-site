package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
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

func GetUserPosts(c *gin.Context) {

	username := strings.TrimSpace(c.Param("username"))

	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username is required",
		})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))

	if limit < 1 || limit > 20 {
		limit = 5
	}

	var authorID uint64
	var accountStatus string

	err := config.DB.QueryRow(
		`SELECT id, account_status FROM users
		WHERE username = ? AND deleted_at IS NULL`,
		username,
	).Scan(&authorID, &accountStatus)

	if err == sql.ErrNoRows || accountStatus != "active" {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch user",
		})
		return
	}

	rows, err := config.DB.Query(
		`SELECT id, uuid, title, excerpt, tag, cover_image,
				views_count, likes_count, comments_count, published_at, created_at
		FROM blog_posts
		WHERE author_id = ? AND status = 'published' AND deleted_at IS NULL
		ORDER BY published_at DESC
		LIMIT ?
		`,
		authorID, limit,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch posts",
		})
		return
	}

	defer rows.Close()

	posts := []models.Post{}

	for rows.Next() {

		var p models.Post
		var excerpt, tag, cover sql.NullString
		var publishedAt sql.NullTime

		if err := rows.Scan(
			&p.ID, &p.UUID, &p.Title, &excerpt, &tag, &cover,
			&p.ViewsCount, &p.LikesCount, &p.CommentCount, &publishedAt, &p.CreatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read posts",
			})
			return
		}

		p.Excerpt = excerpt.String
		p.Tag = tag.String
		p.CoverImage = cover.String

		if publishedAt.Valid {
			p.PublishedAt = &publishedAt.Time
		}

		posts = append(posts, p)

	}

	c.JSON(http.StatusOK, gin.H{
			"posts": posts,
	})

}