package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sinun/powerlog-backend/utils"
)

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return utils.ErrorResponse(c, 401, "Authorization header required")
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			return utils.ErrorResponse(c, 401, "Bearer token required")
		}

		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "ganti_dengan_random_string_panjang"
		}

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			return utils.ErrorResponse(c, 401, "Invalid or expired token")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return utils.ErrorResponse(c, 401, "Invalid token claims")
		}

		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			return utils.ErrorResponse(c, 401, "Invalid user_id in token")
		}

		c.Locals("user_id", uint(userIDFloat))
		return c.Next()
	}
}
