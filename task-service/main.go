package main

import (
	"fmt"
	"task-service/config"
	"task-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()
	router := gin.Default()
	routes.SetupRoutes(router)
	fmt.Println("Starting task-service on port 8082...")
	router.Run(":8082")
}
