package routes

import (
	"net/http"
	// "database/sql"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/handlers"
	"server/middleware"
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

	auth := r.Group("/api/auth")
	{
		auth.POST("/register",handlers.Register)
		auth.POST("/login",handlers.Login)
		auth.POST("/logout",handlers.Logout)
		auth.GET("/me",middleware.RequireAuth(), handlers.Me)
		auth.GET("/send-verification-otp",middleware.RequireAuth(),handlers.SendVerificationOTP)
		auth.POST("/verify-email",middleware.RequireAuth(),handlers.VerifyEmail)
		auth.GET("/email-verification-status",middleware.RequireAuth(),handlers.EmailVerificationStatus)
		auth.PUT("/profile",middleware.RequireAuth(),handlers.UpdateProfile)
		auth.POST("/avatar",middleware.RequireAuth(), handlers.UploadAvatar)
	}

}