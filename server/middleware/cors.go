package middleware

import (

	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

)

func SetupCors(r *gin.Engine) {

	frontendURL := os.Getenv("FRONTEND_URL")

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			frontendURL,
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
		MaxAge: 12*time.Hour,
	}))

}