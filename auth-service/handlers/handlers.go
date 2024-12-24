package handlers

import (
	"auth-service/models"
	"auth-service/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	fmt.Println("Register 요청 수신")
	
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		fmt.Printf("JSON 바인딩 에러: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error":  "잘못된 요청입니다.",
		})
		return
	}

	fmt.Printf("사용자 등록 시도: %s\n", user.Email)
	
	if err := models.CreateUser(&user); err != nil {
		fmt.Printf("사용자 생성 에러: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error":  err.Error(),
		})
		return
	}

	fmt.Printf("사용자 등록 성공: %s\n", user.Email)
	
	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"message": "registration successful",
		"data": gin.H{
			"email": user.Email,
		},
	})
}

func Login(c *gin.Context) {
	fmt.Println("Login 요청 수신")
	
	var creds models.Credentials
	if err := c.ShouldBindJSON(&creds); err != nil {
		fmt.Printf("JSON 바인딩 에러: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "error",
			"error": "잘못된 요청입니다.",
		})
		return
	}

	fmt.Printf("로그인 시도: %s\n", creds.Email)
	
	user, err := models.AuthenticateUser(creds.Email, creds.Password)
	if err != nil {
		fmt.Printf("인증 실패: %v\n", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "error",
			"error": "이메일 또는 비밀번호가 올바르지 않습니다.",
		})
		return
	}

	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		fmt.Printf("토큰 생성 에러: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status": "error",
			"error": "토큰 생성에 실패했습니다.",
		})
		return
	}

	fmt.Printf("로그인 성공: %s\n", user.Email)
	
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"token": token,
		"user": gin.H{
			"email": user.Email,
		},
	})
}
