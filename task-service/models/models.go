package models

import (
	"task-service/internal/database"
)

type Task struct {
	ID          string `gorm:"primaryKey" json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	UserID      uint   `json:"user_id"`
}

func CreateTask(task *Task) error {
	return database.GetDB().Create(task).Error
}

func GetAllTasks() ([]Task, error) {
	var tasks []Task
	err := database.GetDB().Find(&tasks).Error
	return tasks, err
}

func UpdateTask(task *Task) error {
	return database.GetDB().Save(task).Error
}

func DeleteTask(id string) error {
	return database.GetDB().Delete(&Task{}, id).Error
}
