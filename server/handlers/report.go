package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"server/cache"
	"server/config"
	"server/helper"
	"server/models"
)

var validReportReasons = map[string]bool{
	"spam": true,
	"harassment": true,
	"hate_speech": true,
	"misinformation": true,
	"nudity": true,
	"violence": true,
	"other": true,
}

func ReportPost(c *gin.Context) {

	userID, _ := helper.GetUserID(c)
	uuidParam := c.Param("uuid")

	var in models.ReportPostInput

	if err := c.ShouldBindJSON(&in); err != nil || !validReportReasons[in.Reason] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "A valid reason is required",
		})
		return
	}

	var postID, authorID uint64

	err := config.DB.QueryRow(
		"SELECT id, author_id FROM blog_posts WHERE uuid = ? AND deleted_at IS NULL", uuidParam,
	).Scan(&postID, &authorID)

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

	if authorID == userID {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "You cannot report your own post",
		})
		return
	}

	var existingID uint64

	err = config.DB.QueryRow(
		"SELECT id FROM blog_post_reports WHERE post_id = ? AND reporter_id = ?", postID, userID,
	).Scan(&existingID)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "You have already reported this post",
		})
		return
	}

	if err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to check existing report",
		})
		return
	}

	reportUUID := uuid.NewString()

	if _, err := config.DB.Exec(
		"INSERT INTO blog_post_reports (uuid, post_id, reporter_id, reason, description) VALUES (?, ?, ?, ?, ?)",
		reportUUID, postID, userID, in.Reason, in.Description,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to report post",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Post reported successfully",
		"uuid": reportUUID,
	})

}

func GetReports(c *gin.Context) {

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	status := c.DefaultQuery("status", "pending")

	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 50 {
		limit = 20
	}

	offset := (page - 1) * limit

	args := []any{}

	query := `
		SELECT
			r.id, r.uuid, r.post_id, p.uuid, p.title,
			r.reporter_id, u.first_name, u.last_name,
			r.reason, r.description, r.status, r.created_at
		FROM blog_post_reports r
		JOIN blog_posts p ON p.id = r.post_id
		JOIN users u ON u.id = r.reporter_id
		WHERE 1 = 1
	`

	if status != "" && status != "all" {
		query += " AND r.status = ?"
		args = append(args, status)
	}

	query += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)

	rows, err := config.DB.Query(query, args...)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch reports",
		})
		return
	}

	defer rows.Close()

	reports := []models.PostReport{}

	for rows.Next() {

		var r models.PostReport
		var lastName, description sql.NullString

		if err := rows.Scan(
			&r.ID, &r.UUID, &r.PostID, &r.PostUUID, &r.PostTitle,
			&r.ReporterID, &r.ReporterName, &lastName,
			&r.Reason, &description, &r.Status, &r.CreatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to read reports",
			})
			return
		}

		if lastName.Valid {
			r.ReporterName += " " + lastName.String
		}

		r.Description = description.String

		reports = append(reports, r)

	}

	c.JSON(http.StatusOK, gin.H{
		"reports": reports,
		"page": page,
		"limit": limit,
	})

}

func AdminDeletePost(c *gin.Context) {

	adminID := c.MustGet("user_id").(uint64)
	uuidParam := c.Param("uuid")

	var postID uint64

	err := config.DB.QueryRow(
		"SELECT id FROM blog_posts WHERE uuid = ? AND deleted_at IS NULL",uuidParam,
	).Scan(&postID)

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

	tx, err := config.DB.Begin()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete post",
		})
		return
	}

	if _, err := tx.Exec("UPDATE blog_posts SET deleted_at = NOW() WHERE id = ?", postID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete post",
		})
		return
	}

	if _, err := tx.Exec(
		"UPDATE blog_post_reports SET status = 'reviewed', reviewed_by = ?, reviewed_at = NOW() WHERE post_id = ? AND status = 'pending'",
		adminID, postID,
	); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete post",
		})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete post",
		})
		return
	}

	cache.Delete("post:" + uuidParam)

	c.JSON(http.StatusOK, gin.H{
		"message": "Post deleted",
	})

}

func DismissReport(c *gin.Context) {

	adminID := c.MustGet("user_id").(uint64)
	uuidParam := c.Param("uuid")

	res, err := config.DB.Exec(
		"UPDATE blog_post_reports SET status = 'dismissed', reviewed_by = ?, reviewed_at = NOW() WHERE uuid = ? AND status = 'pending'",
		adminID, uuidParam,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to dismiss report",
		})
		return
	}

	if n, _ := res.RowsAffected(); n == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Report not found or already reviewed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Report dismissed",
	})

}