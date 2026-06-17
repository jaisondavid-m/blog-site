package helper

import "github.com/gin-gonic/gin"

func GetUserID(c *gin.Context) (uint64, bool) {

	val, exists := c.Get("user_id")

	if !exists {
		return 0, false
	}

	id, ok := val.(uint64)
	return id, ok

}