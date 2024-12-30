package routes

import (
	"net/http"
	"strings"
	"task-service/handlers"
)

func SetupRouter() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		path := r.URL.Path

		switch {
		case r.Method == "GET" && path == "/api/tasks":
			handlers.GetTasks(w, r)
		case r.Method == "POST" && path == "/api/tasks":
			handlers.CreateTask(w, r)
		case r.Method == "GET" && strings.HasPrefix(path, "/api/tasks/user/"):
			handlers.GetTasksByUserID(w, r)
		case r.Method == "GET" && strings.HasPrefix(path, "/api/tasks/subtasks/"):
			handlers.GetSubTasks(w, r)
		case r.Method == "GET" && strings.HasPrefix(path, "/api/tasks/parent/"):
			handlers.GetParentTask(w, r)
		case r.Method == "GET" && strings.HasPrefix(path, "/api/tasks/hierarchy/"):
			handlers.GetTaskHierarchy(w, r)
		case r.Method == "PUT" && strings.HasPrefix(path, "/api/tasks/"):
			handlers.UpdateTask(w, r)
		case r.Method == "DELETE" && strings.HasPrefix(path, "/api/tasks/"):
			handlers.DeleteTask(w, r)
		default:
			http.NotFound(w, r)
		}
	})
}
