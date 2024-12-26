package main

import (
	"auth-service/config"
	"auth-service/routes"
	"fmt"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()
	router := gin.Default()

	routes.SetupRoutes(router)
	fmt.Println("Starting auth-service on port 8081...")
	router.Run(":8081")
}
