package handlers

import (
	
	"net/http"
	"strconv"
	"database/sql"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/helper"
	"server/models"

)

func GetMyPosts(c *gin.Context) {

	userID, _ := helper.GetUserID(c)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 50 {
		limit = 10
	}

	offset := (page - 1) * limit
	status := c.Query("status")

	args := []any{userID}

	query := `
		SELECT
			p.id, p.uuid, p.author_id, u.first_name, u.last_name, u.avatar_url,
			p.title, p.excerpt, p.tag, p.cover_image, p.status,
			p.views_count, p.likes_count, p.comments_count, p.published_at, p.created_at
		FROM blog_posts p
		JOIN users u on u.id = p.author_id
		WHERE p.author_id = ? AND p.deleted_at IS NULL
	`

	if status != "" {
		query += " AND p.status = ?"
		args = append(args, status)
	}

	query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)

	rows, err := config.DB.Query(query, args...)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch your posts",
		})
		return 
	}

	defer rows.Close()

	posts := []models.Post{}

	for rows.Next() {

		var p models.Post
		var lastName, avatar, excerpt, tag, cover sql.NullString
		var publishedAt sql.NullTime

		if err := rows.Scan(
			&p.ID, &p.UUID, &p.AuthorID, &p.AuthorName, &lastName, &avatar,
			&p.Title, &excerpt, &tag, &cover, &p.Status,
			&p.ViewsCount, &p.LikesCount, &p.CommentCount, &publishedAt, &p.CreatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read posts",
			})
			return
		}

		if lastName.Valid {
			p.AuthorName += " " + lastName.String
		}

		p.AuthorAvatar = avatar.String
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
		"page": page,
		"limit": limit,
	})

}


func GetMyPostOverview(c *gin.Context) {

	userID, _ := helper.GetUserID(c)

	var overview models.PostsOverview

	err := config.DB.QueryRow(`
		SELECT
			COUNT(*),
			COALESCE(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END),0),
			COALESCE(SUM(views_count),0),
			COALESCE(SUM(likes_count),0),
			COALESCE(SUM(comments_count),0)
		FROM blog_posts
		WHERE author_id = ? AND deleted_at IS NULL
	`, userID).Scan(
		&overview.TotalPosts,
		&overview.PublishedCount,
		&overview.DraftCount,
		&overview.TotalViews,
		&overview.TotalLikes,
		&overview.TotalComments,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetcch overview",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"overview": overview,
	})

}