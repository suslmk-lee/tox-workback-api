package main

import (
	"task-service/config"
	"task-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()
	router := gin.Default()
	routes.SetupRoutes(router)
	router.Run(":8082")
}
