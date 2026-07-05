package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	// "strconv"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/helper"
	"server/models"
	// "server/models"
)

func ToggleBookmark(c *gin.Context) {

	userID, _ := helper.GetUserID(c)
	uuidParam := c.Param("uuid")

	var postID uint64

	err := config.DB.QueryRow("SELECT id FROM blog_posts WHERE uuid = ? AND deleted_at IS NULL", uuidParam).Scan(&postID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Post not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch post",
		})
		return
	}

	var exists bool

	config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM blog_bookmarks WHERE post_id = ? AND user_id = ?)", postID, userID).Scan(&exists)

	if exists {
		if _, err := config.DB.Exec("DELETE FROM blog_bookmarks WHERE post_id = ? AND user_id = ?", postID, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to remove bookmark",
			})
			return
		} else {
			if _, err := config.DB.Exec("INSERT INTO blog_bookmarks (post_id, user_id) VALUES (?, ?)",postID, userID); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to add add bookmark",
				})
				return
			}
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"bookmarked": !exists,
	})
}

func GetBookmarks(c *gin.Context) {

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

	rows, err := config.DB.Query(`
		SELECT
			p.id, p.uuid, p.author_id, u.first_name, u.last_name, u.avatar_url,
			p.title, p.excerpt, p.tag, p.cover_image, p.views_count,
			p.likes_count, p.comments_count, p.published_at, p.created_at
		FROM blog_bookmarks b
		JOIN blog_posts p ON p.id = b.post_id
		JOIN users U on u.id = p.author_id
		WHERE b.user_id = ? AND p.deleted_at IS NULL
		ORDER BY b.created_at DESC
		LIMIT ? OFFSET ?
	`, userID, limit, offset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch bookmarks",
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
			&p.Title, &excerpt, &tag, &cover, &p.ViewsCount,
			&p.LikesCount, &p.CommentCount, &publishedAt, &p.CreatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read bookmarks",
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

		p.IsBookmarked = true

		posts = append(posts, p)

	}

	c.JSON(http.StatusOK, gin.H{
		"posts": posts,
		"page": page,
		"limit": limit,
	})

}