package models

import (
	"auth-service/internal/database"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// User roles
const (
	RoleGuest    = "guest"
	RoleUser     = "user"
	RoleProject  = "project"
	RoleAdmin    = "admin"
)

type User struct {
	ID        uint      `gorm:"primaryKey"`
	Name      string    `gorm:"not null"`
	Email     string    `gorm:"uniqueIndex;not null"`
	Password  string    `gorm:"not null"`
	Role      string    `gorm:"type:varchar(20);default:'user'"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

type Credentials struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// IsAdmin checks if the user has admin role
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// CreateUser creates a new user
func CreateUser(user *User) error {
	hashedPassword, err := HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword
	
	// role이 설정되지 않은 경우 기본값 설정
	if user.Role == "" {
		user.Role = RoleUser
	}
	
	return database.GetDB().Create(user).Error
}

// AuthenticateUser authenticates a user
func AuthenticateUser(email, password string) (*User, error) {
	var user User
	if err := database.GetDB().Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, err
	}

	return &user, nil
}

// GetAllUsers returns all users
func GetAllUsers() ([]User, error) {
	var users []User
	err := database.GetDB().Select("id, name, email, role, created_at, updated_at").Find(&users).Error
	return users, err
}

// GetUserByID returns a user by ID
func GetUserByID(id uint) (*User, error) {
	var user User
	err := database.GetDB().Select("id, name, email, role, created_at, updated_at").Where("id = ?", id).First(&user).Error
	return &user, err
}

// UpdateUser updates a user's information
func UpdateUser(user *User) error {
	// role이 설정되지 않은 경우 기본값 설정
	if user.Role == "" {
		user.Role = RoleUser
	}
	return database.GetDB().Save(user).Error
}

// DeleteUser deletes a user
func DeleteUser(id uint) error {
	return database.GetDB().Delete(&User{}, id).Error
}
