package main

import (
	"auth-service/config"
	"auth-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()
	router := gin.Default()
	routes.SetupRoutes(router)
	router.Run(":8081")
}
