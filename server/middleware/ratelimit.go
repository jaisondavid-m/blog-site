package middleware

import (
	"fmt"
	"net/http"
	"time"

	"server/config"

	"github.com/gin-gonic/gin"
	
)

func RateLimit(scope string, limit int, window time.Duration) gin.HandlerFunc {

	return func(c *gin.Context) {

		identifier := c.ClientIP()

		if uid, exists := c.Get("user_id"); exists {
			identifier = fmt.Sprintf("uid:%v", uid)
		}

		key := fmt.Sprintf("ratelimit:%s:%s", scope, identifier)

		count, err := config.RDB.Incr(config.Ctx, key).Result()

		if err != nil {
			c.Next()
			return 
		}

		if count == 1 {
			config.RDB.Expire(config.Ctx, key, window)
		}

		if count > int64(limit) {

			ttl, _ := config.RDB.TTL(config.Ctx, key).Result()
			c.Header("Retry-After", fmt.Sprintf("%.of", ttl.Seconds()))
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too may requests, please try again later",
			})
			
			c.Abort()
			return

		}

		c.Next()

	}

}