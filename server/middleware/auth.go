package middleware

import (
	
	"net/http"

	"server/utils"

	"github.com/gin-gonic/gin"

)

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie("auth_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":"Not Authenticated",
			})
			c.Abort()
			return
		}
		claims, err := utils.ParseToken(cookie)
		if err != nil {
			c.JSON(http.StatusUnauthorized,gin.H{
				"error":"Invalid or expired session",
			})
			c.Abort()
			return
		}
		c.Set("user_id",claims.UserID)
		c.Next()
	}
}