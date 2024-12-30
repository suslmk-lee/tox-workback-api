package models

import (
	"task-service/internal/database"
)

type TaskType string
type TaskStatus string
type TaskPriority string

const (
	// Task Types
	TaskType1  TaskType = "1"
	TaskType2  TaskType = "2"
	TaskType3  TaskType = "3"
	TaskType4  TaskType = "4"
	TaskType5  TaskType = "5"
	TaskType6  TaskType = "6"
	TaskType7  TaskType = "7"
	TaskType8  TaskType = "8"
	TaskType9  TaskType = "9"
	TaskType10 TaskType = "10"
	TaskType11 TaskType = "11"
	TaskType12 TaskType = "12"

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
	AssigneeID     *int         `gorm:"column:assignee_id" json:"assignee_id,omitempty"`
	StartTime      *int64       `gorm:"column:start_time" json:"start_time,omitempty"`
	DueDate        *int64       `gorm:"column:due_date" json:"due_date,omitempty"`
	Progress       int          `gorm:"column:progress" json:"progress"`
	EstimatedHours *int64       `gorm:"column:estimated_hour" json:"estimated_hours,omitempty"`
	UserID         string       `gorm:"column:user_id;type:varchar(20)" json:"user_id"`
	ParentID       *int64       `gorm:"column:parent_id;type:bigint" json:"parent_id,omitempty"`
	CreatedAt      int64        `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      int64        `gorm:"column:updated_at" json:"updated_at"`
}

func (Task) TableName() string {
	return "tasks"
}

func CreateTask(task *Task) error {
	if task.Status == "" {
		task.Status = TaskStatusTodo
	}
	if task.Type == "" {
		task.Type = TaskType12
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

// 새로 추가된 함수들

// GetSubTasks 특정 태스크의 하위 태스크들을 조회
func GetSubTasks(parentID int64) ([]Task, error) {
	var tasks []Task
	err := database.GetDB().Where("parent_id = ?", parentID).Find(&tasks).Error
	return tasks, err
}

// GetParentTask 특정 태스크의 상위 태스크를 조회
func GetParentTask(taskID int64) (*Task, error) {
	var task Task
	err := database.GetDB().First(&task, taskID).Error
	if err != nil {
		return nil, err
	}

	if task.ParentID == nil {
		return nil, nil
	}

	var parentTask Task
	err = database.GetDB().First(&parentTask, *task.ParentID).Error
	if err != nil {
		return nil, err
	}

	return &parentTask, nil
}

// GetTaskHierarchy 특정 태스크의 전체 계층 구조를 조회
type TaskHierarchy struct {
	Task     Task            `json:"task"`
	SubTasks []TaskHierarchy `json:"sub_tasks,omitempty"`
}

func GetTaskHierarchy(taskID int64) (*TaskHierarchy, error) {
	var task Task
	if err := database.GetDB().First(&task, taskID).Error; err != nil {
		return nil, err
	}

	hierarchy := &TaskHierarchy{Task: task}

	// 하위 태스크들 조회
	subTasks, err := GetSubTasks(taskID)
	if err != nil {
		return nil, err
	}

	// 각 하위 태스크의 계층 구조를 재귀적으로 조회
	for _, subTask := range subTasks {
		subHierarchy, err := GetTaskHierarchy(subTask.ID)
		if err != nil {
			return nil, err
		}
		hierarchy.SubTasks = append(hierarchy.SubTasks, *subHierarchy)
	}

	return hierarchy, nil
}
