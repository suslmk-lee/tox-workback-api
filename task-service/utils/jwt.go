package utils

import (
	"errors"
	"strings"
	"task-service/config"

	"github.com/golang-jwt/jwt"
)

func ValidateJWT(tokenString string) (uint, error) {
	// Bearer 토큰에서 실제 토큰 부분만 추출
	tokenParts := strings.Split(tokenString, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		return 0, errors.New("invalid token format")
	}
	tokenString = tokenParts[1]

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(config.Config.JWTSecret), nil
	})

	if err != nil {
		return 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := uint(claims["user_id"].(float64))
		return userID, nil
	}

	return 0, errors.New("invalid token")
}
