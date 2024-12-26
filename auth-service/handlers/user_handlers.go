package handlers

import (
	"auth-service/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetUsers returns a list of all users
func GetUsers(c *gin.Context) {
	users, err := models.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "사용자 목록을 가져오는데 실패했습니다",
		})
		return
	}

	var userResponses []gin.H
	for _, user := range users {
		userResponses = append(userResponses, gin.H{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"role":       user.Role,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   userResponses,
	})
}

// GetUser returns a specific user
func GetUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "잘못된 사용자 ID입니다",
		})
		return
	}

	user, err := models.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status": "error",
			"error":  "사용자를 찾을 수 없습니다",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"role":       user.Role,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		},
	})
}

// CreateUser creates a new user
func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "잘못된 요청 데이터입니다",
		})
		return
	}

	// 기본 role을 'user'로 설정
	if user.Role == "" {
		user.Role = models.RoleUser
	}

	// role 유효성 검사
	if !isValidRole(user.Role) {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "잘못된 역할입니다",
		})
		return
	}

	if err := models.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "사용자 생성에 실패했습니다",
		})
		return
	}

	// 비밀번호는 응답에서 제외
	userResponse := gin.H{
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"role":       user.Role,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	}

	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data":   userResponse,
	})
}

// isValidRole checks if the role is valid
func isValidRole(role string) bool {
	validRoles := []string{models.RoleGuest, models.RoleUser, models.RoleProject, models.RoleAdmin}
	for _, r := range validRoles {
		if r == role {
			return true
		}
	}
	return false
}

// UpdateUser updates user information
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "잘못된 사용자 ID입니다",
		})
		return
	}

	// 현재 로그인한 사용자의 ID 확인
	currentUserID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "인증 정보를 찾을 수 없습니다",
		})
		return
	}

	// 현재 로그인한 사용자 정보 조회
	currentUser, err := models.GetUserByID(currentUserID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "사용자 정보를 조회할 수 없습니다",
		})
		return
	}

	// 기존 사용자 정보 조회
	user, err := models.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status": "error",
			"error":  "사용자를 찾을 수 없습니다",
		})
		return
	}

	// 업데이트할 데이터 바인딩
	var updateData struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "잘못된 요청 데이터입니다",
		})
		return
	}

	// role은 관리자만 변경 가능
	if updateData.Role != "" {
		if !currentUser.IsAdmin() {
			c.JSON(http.StatusForbidden, gin.H{
				"status": "error",
				"error":  "역할을 변경할 권한이 없습니다",
			})
			return
		}
		if !isValidRole(updateData.Role) {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "error",
				"error":  "잘못된 역할입니다",
			})
			return
		}
		user.Role = updateData.Role
	}

	if updateData.Name != "" {
		user.Name = updateData.Name
	}
	if updateData.Email != "" {
		user.Email = updateData.Email
	}
	if updateData.Password != "" {
		hashedPassword, err := models.HashPassword(updateData.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status": "error",
				"error":  "비밀번호 해싱에 실패했습니다",
			})
			return
		}
		user.Password = hashedPassword
	}

	if err := models.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "사용자 정보 업데이트에 실패했습니다",
		})
		return
	}

	// 비밀번호는 응답에서 제외
	userResponse := gin.H{
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"role":       user.Role,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   userResponse,
	})
}

// DeleteUser deletes a user
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	userID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "잘못된 사용자 ID입니다",
		})
		return
	}

	// 현재 로그인한 사용자의 ID 확인
	currentUserID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "인증 정보를 찾을 수 없습니다",
		})
		return
	}

	// 현재 로그인한 사용자 정보 조회
	currentUser, err := models.GetUserByID(currentUserID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "사용자 정보를 조회할 수 없습니다",
		})
		return
	}

	// 관리자이거나 자신의 계정인 경우에만 삭제 가능
	if !currentUser.IsAdmin() && currentUserID.(uint) != uint(userID) {
		c.JSON(http.StatusForbidden, gin.H{
			"status": "error",
			"error":  "이 작업을 수행할 권한이 없습니다",
		})
		return
	}

	if err := models.DeleteUser(uint(userID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "사용자 삭제에 실패했습니다",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "사용자가 삭제되었습니다",
	})
}
