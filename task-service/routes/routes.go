package routes

import (
	"task-service/handlers"
	"task-service/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// Public routes
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Protected routes
	api := router.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.POST("/tasks", handlers.CreateTask)
		api.GET("/tasks", handlers.GetTasks)
		api.PUT("/tasks/:id", handlers.UpdateTask)
		api.DELETE("/tasks/:id", handlers.DeleteTask)
	}
}
