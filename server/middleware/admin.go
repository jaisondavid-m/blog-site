package middleware

import (

	"net/http"

	"server/config"

	"github.com/gin-gonic/gin"

)

func RequireAdmin() gin.HandlerFunc {

	return func(c *gin.Context) {
		
		userID := c.MustGet("user_id").(uint64)

		var role string

		err := config.DB.QueryRow(
			"SELECT role FROM users WHERE id = ? AND deleted_at IS NULL",
			userID,
		).Scan(&role)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User not found",
			})
			c.Abort()
			return
		}

		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Admin access required",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}


