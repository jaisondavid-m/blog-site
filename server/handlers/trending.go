package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/helper"
	"server/models"
)

func GetTrendingPosts(c *gin.Context) {

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	days, _ := strconv.Atoi(c.DefaultQuery("days", "7"))

	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 50 {
		limit = 10
	}

	if days < 1 || days > 365 {
		days = 7
	}

	offset := (page - 1) * limit
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
		query += `0 AS is_liked, 0 is_bookmarked`
	}

	query += `,
			(p.likes_count * 3 + p.comments_count * 2 + p.views_count) AS trend_score
		FROM blog_posts p
		JOIN users u ON u.id = p.author_id
		WHERE p.status = 'published'
			AND p.deleted_at IS NULL
			AND p.published_at >= (NOW() - INTERVAL ? DAY)
		ORDER BY trend_score DESC, p.published_at DESC
		LIMIT ? OFFSET ?
	`

	args = append(args, days, limit, offset)

	rows, err := config.DB.Query(query, args...)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch trending posts",
		})
		return
	}

	defer rows.Close()

	posts := []models.Post{}

	for rows.Next() {

		var p models.Post
		var lastName, avatar, excerpt, tagVal, cover sql.NullString
		var publishedAt sql.NullTime
		var trendScore uint

		if err := rows.Scan(
			&p.ID, &p.UUID, &p.AuthorID, &p.AuthorName, &lastName, &avatar,
			&p.Title, &excerpt, &tagVal, &cover, &p.ViewsCount,
			&p.LikesCount, &p.CommentCount, &publishedAt, &p.CreatedAt,
			&p.IsLiked, &p.IsBookmarked, &trendScore,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read trending posts",
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
		"posts": posts,
		"page":  page,
		"limit": limit,
		"days":  days,
	})

}
