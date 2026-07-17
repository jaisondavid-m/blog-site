package handlers

import (

	"net/http"
	"database/sql"

	"github.com/gin-gonic/gin"

	"server/config"
	// "server/models"

)

func updateAccountStatus(c *gin.Context, newStatus string) {

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
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Cannot change status of another admin",
		})
		return
	}

	_, err = config.DB.Exec(
		"UPDATE users SET account_status = ? WHERE id = ?",
		newStatus, targetID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update user status",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User status updated to " + newStatus,
	})

}