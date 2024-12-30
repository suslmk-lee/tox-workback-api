package routes

import (
	"net/http"
	"task-service/handlers"
)

func SetupRouter() http.Handler {
	mux := http.NewServeMux()

	// API 라우트 설정
	mux.HandleFunc("/api/tasks", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handlers.CreateTask(w, r)
		case http.MethodGet:
			handlers.GetTasks(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/tasks/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			handlers.UpdateTask(w, r)
		case http.MethodDelete:
			handlers.DeleteTask(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/tasks/user/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			handlers.GetTasksByUserID(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// CORS 미들웨어 설정
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// OPTIONS 요청 처리
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 실제 요청 처리
		mux.ServeHTTP(w, r)
	})
}
