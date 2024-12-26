package middleware

import (
	"auth-service/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status": "error",
				"error":  "인증이 필요합니다",
			})
			c.Abort()
			return
		}

		// Bearer 토큰에서 실제 토큰 추출
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status": "error",
				"error":  "잘못된 인증 형식입니다",
			})
			c.Abort()
			return
		}

		userID, err := utils.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status": "error",
				"error":  "유효하지 않은 토큰입니다",
			})
			c.Abort()
			return
		}

		// 사용자 ID를 컨텍스트에 저장
		c.Set("userID", userID)
		c.Next()
	}
}
