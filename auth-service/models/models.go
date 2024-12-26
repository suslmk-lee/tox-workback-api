package models

import (
	"auth-service/internal/database"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const (
	RoleAdmin   = "admin"
	RoleUser    = "user"
	RoleGuest   = "guest"
	RoleProject = "project"
)

// User represents a user in the system
type User struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	Name       string         `json:"name" gorm:"not null"`
	Email      string         `json:"email" gorm:"uniqueIndex;not null"`
	Password   string         `json:"-" gorm:"not null"`
	Role       string         `json:"role" gorm:"type:varchar(20);default:'user'"`
	Company    string         `json:"company" gorm:"not null"`
	Department string         `json:"department" gorm:"not null"`
	Position   string         `json:"position" gorm:"not null"`
	CreatedAt  time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

type Credentials struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// IsAdmin checks if the user has admin role
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

// IsValidRole checks if the role is valid
func IsValidRole(role string) bool {
	validRoles := []string{RoleGuest, RoleUser, RoleProject, RoleAdmin}
	for _, r := range validRoles {
		if r == role {
			return true
		}
	}
	return false
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// CheckPassword checks if the provided password matches the hashed password
func (u *User) CheckPassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
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

// GetUserByID retrieves a user by their ID
func GetUserByID(id uint) (*User, error) {
	var user User
	result := database.GetDB().First(&user, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, result.Error
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by their email
func GetUserByEmail(email string) (*User, error) {
	var user User
	result := database.GetDB().Where("email = ?", email).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, result.Error
	}
	return &user, nil
}

// GetAllUsers returns all users
func GetAllUsers() ([]User, error) {
	var users []User
	err := database.GetDB().Select("id, name, email, role, company, department, position, created_at, updated_at").Find(&users).Error
	return users, err
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

// IsEmailExists checks if an email already exists
func IsEmailExists(db *gorm.DB, email string, excludeID uint) bool {
	var count int64
	query := database.GetDB().Model(&User{}).Where("email = ?", email)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	query.Count(&count)
	return count > 0
}
