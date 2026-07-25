package main

import (

	// "net/http"

	"log"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/middleware"
	"server/routes"
)

func main() {

	config.ConnectDB()
	config.ConnectRedis()

	var dbName string
	config.DB.QueryRow("SELECT DATABASE()").Scan(&dbName)

	log.Println("Connected database:",dbName)

	r := gin.Default()

	r.Static("/uploads", "./uploads")

	middleware.SetupCors(r)

	routes.SetupRoutes(r)

	r.Run(":8080")

}