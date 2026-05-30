package handlers

import (
	"strconv"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
)

type LiftInput struct {
	LiftType string  `json:"lift_type" validate:"required,oneof=squat bench deadlift"`
	WeightKg float64 `json:"weight_kg" validate:"required,gt=0"`
	Reps     uint    `json:"reps" validate:"required,gt=0"`
	RPE      float64 `json:"rpe" validate:"omitempty,min=6,max=10"`
	Notes    string  `json:"notes"`
	LiftedAt string  `json:"lifted_at" validate:"required"`
}

func GetLifts(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var lifts []models.LiftRecord
	query := database.DB.Where("user_id = ?", userID)

	if liftType := c.Query("lift_type"); liftType != "" {
		query = query.Where("lift_type = ?", liftType)
	}

	if result := query.Order("lifted_at DESC").Find(&lifts); result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to fetch lifts")
	}

	return utils.SuccessResponse(c, 200, "Lift records retrieved", lifts)
}

func CreateLift(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input LiftInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	v := validator.New()
	if err := v.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	liftedAt, err := time.Parse("2006-01-02", input.LiftedAt)
	if err != nil {
		return utils.ErrorResponse(c, 422, "Invalid date format, use YYYY-MM-DD")
	}

	lift := models.LiftRecord{
		UserID:   userID,
		LiftType: input.LiftType,
		WeightKg: input.WeightKg,
		Reps:     input.Reps,
		LiftedAt: liftedAt,
	}

	if input.RPE > 0 {
		rpe := input.RPE
		lift.RPE = &rpe
	}

	if input.Notes != "" {
		lift.Notes = &input.Notes
	}

	if result := database.DB.Create(&lift); result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to create lift record")
	}

	return utils.SuccessResponse(c, 201, "Lift record created", lift)
}

func GetLift(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid ID")
	}

	var lift models.LiftRecord
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&lift); result.Error != nil {
		return utils.ErrorResponse(c, 404, "Lift record not found")
	}

	return utils.SuccessResponse(c, 200, "Lift record retrieved", lift)
}

func UpdateLift(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid ID")
	}

	var lift models.LiftRecord
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&lift); result.Error != nil {
		return utils.ErrorResponse(c, 404, "Lift record not found")
	}

	var input LiftInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	v := validator.New()
	if err := v.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	liftedAt, err := time.Parse("2006-01-02", input.LiftedAt)
	if err != nil {
		return utils.ErrorResponse(c, 422, "Invalid date format, use YYYY-MM-DD")
	}

	lift.LiftType = input.LiftType
	lift.WeightKg = input.WeightKg
	lift.Reps = input.Reps
	lift.LiftedAt = liftedAt

	if input.RPE > 0 {
		lift.RPE = &input.RPE
	} else {
		lift.RPE = nil
	}

	if input.Notes != "" {
		lift.Notes = &input.Notes
	} else {
		lift.Notes = nil
	}

	if result := database.DB.Save(&lift); result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to update lift record")
	}

	return utils.SuccessResponse(c, 200, "Lift record updated", lift)
}

func DeleteLift(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid ID")
	}

	var lift models.LiftRecord
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&lift); result.Error != nil {
		return utils.ErrorResponse(c, 404, "Lift record not found")
	}

	database.DB.Delete(&lift)

	return utils.SuccessResponse(c, 200, "Lift record deleted", nil)
}

func GetLiftSummary(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	type PR struct {
		LiftType string  `json:"lift_type"`
		WeightKg float64 `json:"weight_kg"`
		Reps     uint    `json:"reps"`
		Date     string  `json:"date"`
	}

	var prs []PR
	database.DB.Raw(`
		SELECT lift_type, weight_kg, reps, lifted_at AS date
		FROM lift_records
		WHERE user_id = ? AND deleted_at IS NULL
		ORDER BY lift_type, (weight_kg * (1 + reps / 30.0)) DESC
	`, userID).Scan(&prs)

	summary := make(map[string]*PR)
	for _, pr := range prs {
		if _, ok := summary[pr.LiftType]; !ok {
			summary[pr.LiftType] = &PR{
				LiftType: pr.LiftType,
				WeightKg: pr.WeightKg,
				Reps:     pr.Reps,
				Date:     pr.Date,
			}
		}
	}

	return utils.SuccessResponse(c, 200, "Lift summary retrieved", summary)
}
