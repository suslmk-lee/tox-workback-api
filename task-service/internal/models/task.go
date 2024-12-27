package models

import (
	"task-service/internal/database"
	"time"
)

type TaskType string
type TaskStatus string
type TaskPriority string

const (
	// Task Types
	TaskTypeBug       TaskType = "BUG"
	TaskTypeFeature   TaskType = "FEATURE"
	TaskTypeImprovement TaskType = "IMPROVEMENT"
	TaskTypeTask      TaskType = "TASK"

	// Task Status
	TaskStatusTodo       TaskStatus = "TODO"
	TaskStatusInProgress TaskStatus = "IN_PROGRESS"
	TaskStatusDone       TaskStatus = "DONE"
	TaskStatusBlocked    TaskStatus = "BLOCKED"

	// Task Priority
	TaskPriorityLow    TaskPriority = "LOW"
	TaskPriorityMedium TaskPriority = "MEDIUM"
	TaskPriorityHigh   TaskPriority = "HIGH"
	TaskPriorityCritical TaskPriority = "CRITICAL"
)

type Task struct {
	ID              string       `gorm:"primaryKey" json:"id"`
	Title           string       `json:"title"`
	Description     string       `json:"description"`
	Type            TaskType     `json:"type" gorm:"default:'TASK'"`
	Status          TaskStatus   `json:"status" gorm:"default:'TODO'"`
	Priority        TaskPriority `json:"priority" gorm:"default:'MEDIUM'"`
	AssigneeID      *uint        `json:"assignee_id"`
	StartTime       *time.Time   `json:"start_time"`
	DueDate         *time.Time   `json:"due_date"`
	Progress        int          `json:"progress" gorm:"default:0"` // 0-100
	EstimatedHours  float64      `json:"estimated_hours"`
	UserID          uint         `json:"user_id"`
	CreatedAt       time.Time    `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time    `json:"updated_at" gorm:"autoUpdateTime"`
}

func CreateTask(task *Task) error {
	if task.Status == "" {
		task.Status = TaskStatusTodo
	}
	if task.Type == "" {
		task.Type = TaskTypeTask
	}
	if task.Priority == "" {
		task.Priority = TaskPriorityMedium
	}
	return database.GetDB().Create(task).Error
}

func GetAllTasks() ([]Task, error) {
	var tasks []Task
	err := database.GetDB().Find(&tasks).Error
	return tasks, err
}

func GetTasksByUserID(userID uint) ([]Task, error) {
	var tasks []Task
	err := database.GetDB().Where("user_id = ?", userID).Find(&tasks).Error
	return tasks, err
}

func UpdateTask(task *Task) error {
	return database.GetDB().Save(task).Error
}

func DeleteTask(id string) error {
	return database.GetDB().Delete(&Task{}, id).Error
}
