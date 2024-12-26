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
			"error":  err.Error(),
		})
		return
	}

	// 이메일 중복 체크
	if models.IsEmailExists(nil, user.Email, 0) {
		c.JSON(http.StatusConflict, gin.H{
			"status": "error",
			"error":  "이미 등록된 이메일입니다",
		})
		return
	}

	// role 유효성 검사
	if !models.IsValidRole(user.Role) {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "잘못된 역할입니다",
		})
		return
	}

	// 사용자 생성
	if err := models.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "사용자 생성에 실패했습니다",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data": gin.H{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"role":       user.Role,
			"company":    user.Company,
			"department": user.Department,
			"position":   user.Position,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		},
	})
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

	// 현재 사용자 정보 조회
	user, err := models.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status": "error",
			"error":  "사용자를 찾을 수 없습니다",
		})
		return
	}

	var updateData struct {
		Name       string `json:"name"`
		Email      string `json:"email"`
		Password   string `json:"password"`
		Role       string `json:"role"`
		Company    string `json:"company"`
		Department string `json:"department"`
		Position   string `json:"position"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  err.Error(),
		})
		return
	}

	// 필드 업데이트
	if updateData.Name != "" {
		user.Name = updateData.Name
	}
	if updateData.Email != "" && updateData.Email != user.Email {
		if models.IsEmailExists(nil, updateData.Email, user.ID) {
			c.JSON(http.StatusConflict, gin.H{
				"status": "error",
				"error":  "이미 등록된 이메일입니다",
			})
			return
		}
		user.Email = updateData.Email
	}
	if updateData.Role != "" {
		if !models.IsValidRole(updateData.Role) {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "error",
				"error":  "잘못된 역할입니다",
			})
			return
		}
		user.Role = updateData.Role
	}
	if updateData.Company != "" {
		user.Company = updateData.Company
	}
	if updateData.Department != "" {
		user.Department = updateData.Department
	}
	if updateData.Position != "" {
		user.Position = updateData.Position
	}
	if updateData.Password != "" {
		hashedPassword, err := models.HashPassword(updateData.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status": "error",
				"error":  "비밀번호 처리 중 오류가 발생했습니다",
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

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"role":       user.Role,
			"company":    user.Company,
			"department": user.Department,
			"position":   user.Position,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		},
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

// GetUserProfile returns the profile of the currently logged in user
func GetUserProfile(c *gin.Context) {
	// 현재 로그인한 사용자의 ID 확인
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "인증 정보를 찾을 수 없습니다",
		})
		return
	}

	// 사용자 정보 조회
	user, err := models.GetUserByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "사용자 정보를 조회할 수 없습니다",
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

// UpdateUserProfile updates the profile of the currently logged in user
func UpdateUserProfile(c *gin.Context) {
	// 현재 로그인한 사용자의 ID 확인
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error":  "인증 정보를 찾을 수 없습니다",
		})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  err.Error(),
		})
		return
	}

	// 사용자 정보 조회
	user, err := models.GetUserByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status": "error",
			"error":  "사용자를 찾을 수 없습니다",
		})
		return
	}

	// 이메일 중복 체크 (이메일이 변경된 경우에만)
	if req.Email != "" && req.Email != user.Email {
		if models.IsEmailExists(nil, req.Email, user.ID) {
			c.JSON(http.StatusConflict, gin.H{
				"status": "error",
				"error":  "이미 등록된 이메일입니다",
			})
			return
		}
		user.Email = req.Email
	}

	// 필드 업데이트
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Company != "" {
		user.Company = req.Company
	}
	if req.Department != "" {
		user.Department = req.Department
	}
	if req.Position != "" {
		user.Position = req.Position
	}

	// 비밀번호 업데이트 (비밀번호가 제공된 경우에만)
	if req.Password != "" {
		hashedPassword, err := models.HashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status": "error",
				"error":  "비밀번호 처리 중 오류가 발생했습니다",
			})
			return
		}
		user.Password = hashedPassword
	}

	// 사용자 정보 업데이트
	if err := models.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  "프로필 업데이트에 실패했습니다",
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
			"company":    user.Company,
			"department": user.Department,
			"position":   user.Position,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		},
	})
}

type UpdateUserRequest struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	Company    string `json:"company"`
	Department string `json:"department"`
	Position   string `json:"position"`
}
