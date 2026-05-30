package handlers

import (
	"os"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
	"golang.org/x/crypto/bcrypt"
)

var validate = validator.New()

type RegisterInput struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email,max=150"`
	Password string `json:"password" validate:"required,min=6,max=255"`
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func jwtSecret() string {
	if s := os.Getenv("JWT_SECRET"); s != "" {
		return s
	}
	return "ganti_dengan_random_string_panjang"
}

func generateUserToken(user *models.User) (string, error) {
	expireHours := 72
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(time.Duration(expireHours) * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret()))
}

func Register(c *fiber.Ctx) error {
	var input RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	if err := validate.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	var existing models.User
	if result := database.DB.Where("email = ?", input.Email).First(&existing); result.Error == nil {
		return utils.ErrorResponse(c, 409, "Email already registered")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 12)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Failed to hash password")
	}

	pw := string(hashedPassword)
	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: &pw,
	}

	if result := database.DB.Create(&user); result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to create user")
	}

	return utils.SuccessResponse(c, 201, "User registered successfully", fiber.Map{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"plan":  user.Plan,
	})
}

func Login(c *fiber.Ctx) error {
	var input LoginInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	if err := validate.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	var user models.User
	if result := database.DB.Where("email = ?", input.Email).First(&user); result.Error != nil {
		return utils.ErrorResponse(c, 401, "Invalid email or password")
	}

	// OAuth-only user (no password set)
	if user.Password == nil {
		return utils.ErrorResponse(c, 401, "This account uses social login. Please sign in with Google, Facebook, or X.")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(input.Password)); err != nil {
		return utils.ErrorResponse(c, 401, "Invalid email or password")
	}

	tokenString, err := generateUserToken(&user)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Failed to generate token")
	}

	return utils.SuccessResponse(c, 200, "Login successful", fiber.Map{
		"token": tokenString,
		"user": fiber.Map{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"plan":  user.Plan,
		},
	})
}

func Me(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var user models.User
	if result := database.DB.First(&user, userID); result.Error != nil {
		return utils.ErrorResponse(c, 404, "User not found")
	}

	return utils.SuccessResponse(c, 200, "User profile", fiber.Map{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"plan":  user.Plan,
	})
}
