package handlers

import (

	"net/http"
	"strconv"
	"strings"
	"database/sql"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/models"

)

func GetUsers(c *gin.Context) {

	page, _ := strconv.Atoi(c.DefaultQuery("page","1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit","20"))

	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	search := strings.TrimSpace(c.Query("search"))
	status := c.Query("status")
	role := c.Query("role")
	includeDeleted := c.Query("include_deleted") == "true"

	conditions := []string{}
	args := []interface{}{}

	if !includeDeleted {
		conditions = append(conditions, "deleted_at IS NULL")
	}

	if search != "" {
		conditions = append(conditions, "(username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)")
		like := "%" + search + "%"
		args = append(args, like, like, like, like)
	}

	if status != "" {
		conditions = append(conditions, "account_status = ?")
		args = append(args, status)
	}

	if role != "" {
		conditions = append(conditions, "role = ?")
		args = append(args, role)
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM users " + whereClause
	if err := config.DB.QueryRow(countQuery, args...).Scan(&total); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to count users",
		})
		return
	}

	query := `
	SELECT
		id, uuid, first_name, last_name, username, email,
		role, account_status, email_verified, is_guest,
		last_login_at, created_at
	FROM users
	` + whereClause + `
	ORDER BY created_at DESC
	LIMIT ? OFFSET ?
	`

	listArgs := append(args, limit, offset)

	rows, err := config.DB.Query(query, listArgs...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch users",
		})
		return
	}

	defer rows.Close()

	users := []models.AdminUserListItem{}

	for rows.Next() {

		var u models.AdminUserListItem
		var lastLogin sql.NullString

		err := rows.Scan(
			&u.ID, &u.UUID, &u.FirstName, &u.LastName, &u.Username, &u.Email,
			&u.Role, &u.AccountStatus, &u.EmailVerified, &u.IsGuest,
			&lastLogin, &u.CreatedAt,
		)

		if err != nil {
			continue
		}

		if lastLogin.Valid {
			u.LastLoginAt = &lastLogin.String
		}

		users = append(users, u)

	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"pagination": gin.H{
			"page": page,
			"limit": limit,
			"total": total,
			"pages": (total + limit - 1) / limit,
		},
	})

}

func SuspendUser(c *gin.Context) {
	updateAccountStatus(c, "suspended")
}

func Unsuspend(c *gin.Context) {
	updateAccountStatus(c, "active")
}

func BanUser(c *gin.Context) {
	updateAccountStatus(c, "banned")
}

func UnbanUser(c *gin.Context) {
	updateAccountStatus(c, "active")
}

func DeleteUser(c *gin.Context) {

	uuidParam := c.Param("uuid")
	adminID := c.MustGet("user_id").(uint64)

	var targetID uint64
	var targetRole string

	err := config.DB.QueryRow(
		"SELECT id, role FROM users WHERE uuid = ? AND deleted_at IS NULL",
		uuidParam,
	).Scan(&targetID, &targetRole)

	if err == sql.ErrNoRows {
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

	if targetID == adminID {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "You cannot delete your own account",
		})
		return
	}

	if targetRole == "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Cannot delete another admin",
		})
		return
	}

	_, err = config.DB.Exec(
		"UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
		targetID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete user",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User deleted successfully",
	})

}