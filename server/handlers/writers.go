package handlers

import (
	
	"strconv"
	"net/http"
	"database/sql"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/models"

)

func GetTrendingWriters(c *gin.Context) {

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 50 {
		limit = 10
	}

	offset := (page - 1) * limit

	rows, err := config.DB.Query(`
		SELECT
			u.id, u.uuid, u.first_name, u.last_name, u.username, u.avatar_url,
			COUNT(p.id) AS posts_count,
			COALESCE(SUM(p.likes_count), 0) AS total_likes,
			COALESCE(SUM(p.views_count), 0) AS total_views,
			COALESCE(SUM(p.comments_count), 0) AS total_comments
		FROM users u
		JOIN blog_posts p
			ON p.author_id = u.id
			AND p.status = 'published'
			AND p.deleted_at IS NULL
		WHERE u.deleted_at IS NULL
			AND u.is_guest = FALSE
			AND u.account_status = 'active'
		GROUP BY u.id, u.uuid, u.first_name, u.last_name, u.username, u.avatar_url
		ORDER BY (
			COALESCE(SUM(p.likes_count), 0) * 3
			+ COALESCE(SUM(p.comments_count),0) * 2
			+ COALESCE(SUM(p.views_count), 0)
		) DESC
		LIMIT ? OFFSET ?
	`, limit, offset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch trending writers",
		})
		return
	}

	defer rows.Close()

	writers := []models.TrendingWriter{}

	for rows.Next() {

		var w models.TrendingWriter
		var lastName, avatar, username sql.NullString

		if err := rows.Scan(
			&w.ID, &w.UUID, &w.FirstName, &lastName, &username, &avatar,
			&w.PostsCount, &w.TotalLikes, &w.TotalViews, &w.TotalComments,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read trendingn writers",
			})
			return
		}

		w.LastName = lastName.String
		w.UserName = username.String
		w.AvatarURL = avatar.String

		writers = append(writers, w)

	}

	c.JSON(http.StatusOK, gin.H{
		"writers": writers,
		"page": page,
		"limit": limit,
	})
	

}