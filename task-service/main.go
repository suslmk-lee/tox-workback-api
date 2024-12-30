package main

import (
	"fmt"
	"log"
	"net/http"
	"task-service/config"
	"task-service/routes"
)

func main() {
	// 설정 로드 및 DB 연결
	config.LoadConfig()

	// 라우터 설정
	router := routes.SetupRouter()

	// 서버 시작
	port := ":8082"
	fmt.Printf("Server is running on port %s\n", port)
	if err := http.ListenAndServe(port, router); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
