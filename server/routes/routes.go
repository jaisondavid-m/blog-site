package routes

import (

	"net/http"
	"time"
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
		auth.POST("/register", middleware.RateLimit("register",5,time.Hour) ,handlers.Register)
		auth.POST("/login", middleware.RateLimit("login",10, time.Minute) , handlers.Login)
		auth.POST("/guest", middleware.RateLimit("guest", 20, time.Minute) ,  handlers.GuestLogin)
		auth.POST("/logout",handlers.Logout)
		auth.GET("/me",middleware.RequireAuth(), handlers.Me)
		auth.GET("/send-verification-otp",middleware.RequireAuth(), middleware.RateLimit("otp", 3, 10*time.Minute) ,handlers.SendVerificationOTP)
		auth.POST("/verify-email",middleware.RequireAuth(),handlers.VerifyEmail)
		auth.GET("/email-verification-status",middleware.RequireAuth(),handlers.EmailVerificationStatus)
		auth.PUT("/profile",middleware.RequireAuth(),handlers.UpdateProfile)
		auth.POST("/avatar",middleware.RequireAuth(), handlers.UploadAvatar)
	}

	fp := auth.Group("/forgot-password")
	{
		fp.POST("/find-account", middleware.RateLimit("fp-find",5, time.Hour) ,handlers.FindAccount)
		fp.POST("/send-otp", middleware.RateLimit("fp-otp", 3, 10*time.Minute) ,handlers.SendPasswordResetOTP)
		fp.POST("/verify-otp", middleware.RateLimit("fp-verify", 5, 10*time.Minute) ,handlers.VerifyPasswordResetOTP)
		fp.POST("/reset", middleware.RateLimit("fp-reset", 5, time.Hour) ,handlers.ResetPassword)
	}

	posts := r.Group("/api/posts")
	{
		posts.POST("", middleware.RequireAuth(), middleware.RateLimit("create-post", 10, time.Minute) , handlers.CreatePost)
		posts.GET("",middleware.RequireAuth(), handlers.GetPosts)
		posts.GET("/trending", middleware.OptionalAuth(), handlers.GetTrendingPosts)
		posts.GET("/bookmarks", middleware.RequireAuth(), handlers.GetBookmarks)
		posts.GET("/mine", middleware.RequireAuth(), handlers.GetMyPosts)
		posts.GET("/mine/overview", middleware.RequireAuth(), handlers.GetMyPostOverview)
		posts.GET("/:uuid", middleware.OptionalAuth(), handlers.GetPost)
		posts.PUT("/:uuid", middleware.RequireAuth(), handlers.UpdatePost)
		posts.DELETE("/:uuid", middleware.RequireAuth(), handlers.DeletePost)
		posts.POST("/:uuid/report", middleware.RequireAuth(), handlers.ReportPost)

		posts.POST("/:uuid/like", middleware.RequireAuth(), handlers.ToggleLike)
		posts.POST("/:uuid/bookmark", middleware.RequireAuth(), handlers.ToggleBookmark)

		posts.GET("/:uuid/comments", middleware.RequireAuth(), handlers.GetComments)
		posts.POST("/:uuid/comments", middleware.RequireAuth(), handlers.CreateComment)
		
	}

	comments := r.Group("/api/comments")
	{
		comments.PUT("/:uuid", middleware.RequireAuth(), handlers.UpdateComment)
		comments.DELETE("/:uuid", middleware.RequireAuth(), handlers.DeleteComment)
		comments.POST("/:uuid/like", middleware.RequireAuth(), handlers.ToggleCommentLike)
	}

	users := r.Group("/api/users")
	{
		users.GET("/:username", middleware.RequireAuth(), handlers.GetUserProfile)
		users.GET("/:username/posts", middleware.RequireAuth(), handlers.GetUserPosts)
	}

	notifications := r.Group("/api/notifications")
	{
		notifications.GET("", middleware.RequireAuth(), handlers.GetNotifications)
		notifications.POST("/:uuid/read", middleware.RequireAuth(), handlers.MarkNotificationRead)
		notifications.GET("/unread-count", middleware.RequireAuth(), handlers.GetUnreadNotificationCount)
	}

	writers := r.Group("/api/writers")
	{
		writers.GET("/trending", middleware.OptionalAuth(), handlers.GetTrendingWriters)
	}

	admin := r.Group("/api/admin")
	admin.Use(middleware.RequireAuth(), middleware.RequireAdmin())
	{
		admin.GET("/users", handlers.GetUsers)
		admin.POST("users/:uuid/suspend", handlers.SuspendUser)
		admin.POST("/users/:uuid/unsuspend", handlers.Unsuspend)
		admin.POST("/users/:uuid/ban", handlers.BanUser)
		admin.POST("/users/:uuid/unban", handlers.UnbanUser)
		admin.DELETE("/users/:uuid", handlers.DeleteUser)
		admin.GET("/reports", handlers.GetReports)
		admin.DELETE("/posts/:uuid", handlers.AdminDeletePost)
		admin.POST("/reports/:uuid/dismiss", handlers.DismissReport)
	}

}