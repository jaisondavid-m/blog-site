package middleware

import (

	"server/utils"

	"github.com/gin-gonic/gin"

)

func OptionalAuth() gin.HandlerFunc {

	return func(c *gin.Context) {

		cookie, err := c.Cookie("auth_token")
		if err == nil {
			if claims, err := utils.ParseToken(cookie); err == nil {
				c.Set("user_id",claims.UserID)
			}
		}
		c.Next()
	}

}