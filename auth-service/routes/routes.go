package routes

import (
	"auth-service/handlers"
	"auth-service/middleware"
	"fmt"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// 디버그: 라우트 설정 시작
	fmt.Println("=== 라우트 설정 시작 ===")

	// Public routes
	auth := router.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
		fmt.Println("설정된 auth 라우트:")
		fmt.Println("- POST /auth/register")
		fmt.Println("- POST /auth/login")
	}

	// Protected routes
	api := router.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// User management routes
		users := api.Group("/users")
		{
			users.GET("", handlers.GetUsers)
			users.GET("/:id", handlers.GetUser)
			users.PUT("/:id", handlers.UpdateUser)
			users.DELETE("/:id", handlers.DeleteUser)
			fmt.Println("설정된 users 라우트:")
			fmt.Println("- GET /api/users")
			fmt.Println("- GET /api/users/:id")
			fmt.Println("- PUT /api/users/:id")
			fmt.Println("- DELETE /api/users/:id")
		}
	}

	// 디버그: 등록된 모든 라우트 출력
	routes := router.Routes()
	fmt.Println("\n=== 등록된 모든 라우트 ===")
	for _, route := range routes {
		fmt.Printf("Method: %s, Path: %s\n", route.Method, route.Path)
	}
	fmt.Println("=== 라우트 설정 완료 ===\n")
}
