package main

import (

	// "net/http"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/middleware"
	"server/routes"

)

func main() {

	config.ConnectDB()

	r := gin.Default()

	middleware.SetupCors(r)

	routes.SetupRoutes(r)

	r.Run(":8080")

}