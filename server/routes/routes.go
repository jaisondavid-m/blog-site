package routes

import (
	
	"net/http"
	// "database/sql"

	"github.com/gin-gonic/gin"

	"server/config"

)

func SetupRoutes(r *gin.Engine) {

	r.GET("/",func(c *gin.Context) {
		c.JSON(http.StatusOK,gin.H{
			"message":"Server Running",
		})
	})

	r.GET("/health",func(c *gin.Context) {

		err := config.DB.Ping()

		dbStatus := "up"

		if err != nil {
			dbStatus = "down"
		}

		c.JSON(http.StatusOK,gin.H{
			"status": "ok",
			"database": dbStatus,
			"service":"go-gin-api",
		})

	})

}