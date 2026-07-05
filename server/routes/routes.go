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

	fp := auth.Group("/forgot-password")
	{
		fp.POST("/find-account",handlers.FindAccount)
		fp.POST("/send-otp",handlers.SendPasswordResetOTP)
		fp.POST("/verify-otp",handlers.VerifyPasswordResetOTP)
		fp.POST("/reset",handlers.ResetPassword)
	}

	posts := r.Group("/api/posts")
	{
		posts.POST("", middleware.RequireAuth(), handlers.CreatePost)
		posts.GET("",middleware.RequireAuth(), handlers.GetPosts)
		posts.GET("/:uuid", middleware.OptionalAuth(), handlers.GetPost)
		posts.PUT("/:uuid", middleware.RequireAuth(), handlers.UpdatePost)
		posts.DELETE("/:uuid", middleware.RequireAuth(), handlers.DeletePost)

		posts.POST("/:uuid/like", middleware.RequireAuth(), handlers.ToggleLike)
		posts.POST("/:uuid/bookmark", middleware.RequireAuth(), handlers.ToggleBookmark)

		posts.GET("/bookmarks", middleware.RequireAuth(), handlers.GetBookmarks)
	}

}