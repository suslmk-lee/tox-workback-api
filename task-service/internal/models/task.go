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
	TaskTypeBug         TaskType = "BUG"
	TaskTypeFeature     TaskType = "FEATURE"
	TaskTypeImprovement TaskType = "IMPROVEMENT"
	TaskTypeTask        TaskType = "TASK"

	// Task Status
	TaskStatusTodo       TaskStatus = "TODO"
	TaskStatusInProgress TaskStatus = "IN_PROGRESS"
	TaskStatusDone       TaskStatus = "DONE"
	TaskStatusBlocked    TaskStatus = "BLOCKED"

	// Task Priority
	TaskPriorityLow      TaskPriority = "LOW"
	TaskPriorityMedium   TaskPriority = "MEDIUM"
	TaskPriorityHigh     TaskPriority = "HIGH"
	TaskPriorityCritical TaskPriority = "CRITICAL"
)

type Task struct {
	ID             int64        `gorm:"column:id;primaryKey" json:"id"`
	Title          string       `gorm:"column:title;type:varchar(255)" json:"title"`
	Description    string       `gorm:"column:description;type:text" json:"description"`
	Type           TaskType     `gorm:"column:type;type:varchar(20)" json:"type"`
	Status         TaskStatus   `gorm:"column:status;type:varchar(20)" json:"status"`
	Priority       TaskPriority `gorm:"column:priority;type:varchar(20)" json:"priority"`
	AssigneeID     *int         `gorm:"column:assignee_id" json:"assignee_id"`
	StartTime      *time.Time   `gorm:"column:start_time" json:"start_time"`
	DueDate        *time.Time   `gorm:"column:due_date" json:"due_date"`
	Progress       int          `gorm:"column:progress" json:"progress"`
	EstimatedHours int64        `gorm:"column:estimated_hour" json:"estimated_hours"`
	UserID         string       `gorm:"column:user_id;type:varchar(20)" json:"user_id"`
	CreatedAt      time.Time    `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      time.Time    `gorm:"column:updated_at" json:"updated_at"`
}

func (Task) TableName() string {
	return "tasks"
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

func GetTasksByUserID(userID string) ([]Task, error) {
	var tasks []Task
	err := database.GetDB().Where("user_id = ?", userID).Find(&tasks).Error
	return tasks, err
}

func UpdateTask(task *Task) error {
	return database.GetDB().Save(task).Error
}

func DeleteTask(id int64) error {
	return database.GetDB().Delete(&Task{}, id).Error
}
