package handlers

import (
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
	"gorm.io/gorm/clause"
)

type BodyWeightInput struct {
	WeightKg float64 `json:"weight_kg" validate:"required,gt=0"`
	LoggedAt string  `json:"logged_at" validate:"required"`
	Notes    string  `json:"notes"`
}

func GetBodyWeights(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	limit, _ := strconv.Atoi(c.Query("limit", "12"))

	var logs []models.BodyWeightLog
	result := database.DB.Where("user_id = ?", userID).
		Order("logged_at DESC").
		Limit(limit).
		Find(&logs)
	if result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to fetch body weight logs")
	}

	return utils.SuccessResponse(c, 200, "Body weight logs retrieved", logs)
}

func CreateBodyWeight(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input BodyWeightInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	v := validator.New()
	if err := v.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	log := models.BodyWeightLog{
		UserID:   userID,
		WeightKg: input.WeightKg,
		LoggedAt: input.LoggedAt,
	}
	if input.Notes != "" {
		log.Notes = &input.Notes
	}

	result := database.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "logged_at"}},
		DoUpdates: clause.AssignmentColumns([]string{"weight_kg", "notes"}),
	}).Create(&log)
	if result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to save body weight")
	}

	return utils.SuccessResponse(c, 201, "Body weight saved", log)
}

func UpdateBodyWeight(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid id")
	}

	var input BodyWeightInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	var log models.BodyWeightLog
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&log); result.Error != nil {
		return utils.ErrorResponse(c, 404, "Body weight log not found")
	}

	log.WeightKg = input.WeightKg
	log.LoggedAt = input.LoggedAt
	if input.Notes != "" {
		log.Notes = &input.Notes
	} else {
		log.Notes = nil
	}

	database.DB.Save(&log)
	return utils.SuccessResponse(c, 200, "Body weight log updated", log)
}

func DeleteBodyWeight(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid id")
	}

	result := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.BodyWeightLog{})
	if result.RowsAffected == 0 {
		return utils.ErrorResponse(c, 404, "Body weight log not found")
	}

	return utils.SuccessResponse(c, 200, "Body weight log deleted", nil)
}

func GetLatestBodyWeight(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	sex := c.Query("sex", "male")

	var log models.BodyWeightLog
	result := database.DB.Where("user_id = ?", userID).
		Order("logged_at DESC").
		First(&log)
	if result.Error != nil {
		return utils.ErrorResponse(c, 404, "No body weight records found. Please log your weight first.")
	}

	wc := utils.CalculateWeightClass(log.WeightKg, sex)

	return utils.SuccessResponse(c, 200, "Latest body weight", fiber.Map{
		"weight_kg":          log.WeightKg,
		"logged_at":          log.LoggedAt,
		"recommended_class":  wc.Recommended,
		"next_class_up":      wc.NextClassUp,
		"next_class_down":    wc.NextClassDown,
	})
}
