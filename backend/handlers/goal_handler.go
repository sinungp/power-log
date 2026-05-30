package handlers

import (
	"math"
	"strconv"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
)

type GoalInput struct {
	GoalType        string  `json:"goal_type" validate:"required,oneof=squat_1rm bench_1rm deadlift_1rm body_weight competition"`
	TargetValue     float64 `json:"target_value" validate:"required,gt=0"`
	TargetDate      string  `json:"target_date" validate:"omitempty"`
	CompetitionName string  `json:"competition_name" validate:"omitempty"`
	Federation      string  `json:"federation" validate:"omitempty"`
	Notes           string  `json:"notes"`
}

func GetGoals(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	filter := c.Query("filter", "all")

	var goals []models.UserGoal
	query := database.DB.Where("user_id = ?", userID)
	if filter == "active" {
		query = query.Where("is_achieved = ?", false)
	} else if filter == "achieved" {
		query = query.Where("is_achieved = ?", true)
	}
	query.Order("created_at DESC").Find(&goals)

	return utils.SuccessResponse(c, 200, "Goals retrieved", goals)
}

func CreateGoal(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input GoalInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	v := validator.New()
	if err := v.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	goal := models.UserGoal{
		UserID:      userID,
		GoalType:    input.GoalType,
		TargetValue: input.TargetValue,
	}
	if input.TargetDate != "" {
		goal.TargetDate = &input.TargetDate
	}
	if input.CompetitionName != "" {
		goal.CompetitionName = &input.CompetitionName
	}
	if input.Federation != "" {
		goal.Federation = &input.Federation
	}
	if input.Notes != "" {
		goal.Notes = &input.Notes
	}

	if result := database.DB.Create(&goal); result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to create goal")
	}

	return utils.SuccessResponse(c, 201, "Goal created", goal)
}

func UpdateGoal(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid ID")
	}

	var goal models.UserGoal
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&goal); result.Error != nil {
		return utils.ErrorResponse(c, 404, "Goal not found")
	}

	var input GoalInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	v := validator.New()
	if err := v.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	updates := map[string]interface{}{
		"goal_type":    input.GoalType,
		"target_value": input.TargetValue,
	}
	if input.TargetDate != "" {
		updates["target_date"] = input.TargetDate
	} else {
		updates["target_date"] = nil
	}
	if input.CompetitionName != "" {
		updates["competition_name"] = input.CompetitionName
	} else {
		updates["competition_name"] = nil
	}
	if input.Federation != "" {
		updates["federation"] = input.Federation
	} else {
		updates["federation"] = nil
	}
	if input.Notes != "" {
		updates["notes"] = input.Notes
	} else {
		updates["notes"] = nil
	}

	database.DB.Model(&goal).Updates(updates)
	database.DB.Where("id = ? AND user_id = ?", id, userID).First(&goal)
	return utils.SuccessResponse(c, 200, "Goal updated", goal)
}

func DeleteGoal(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid ID")
	}

	result := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.UserGoal{})
	if result.RowsAffected == 0 {
		return utils.ErrorResponse(c, 404, "Goal not found")
	}

	return utils.SuccessResponse(c, 200, "Goal deleted", nil)
}

func GetGoalProgress(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var goals []models.UserGoal
	database.DB.Where("user_id = ?", userID).Find(&goals)

	type GoalWithProgress struct {
		models.UserGoal
		CurrentValue   float64  `json:"current_value"`
		ProgressPct    float64  `json:"progress_pct"`
		EstimatedDate  *string  `json:"estimated_date,omitempty"`
		DaysRemaining  int      `json:"days_remaining"`
	}

	var result []GoalWithProgress
	for _, g := range goals {
		current, _ := utils.GetCurrentValue(database.DB, userID, g.GoalType)
		pct := utils.CalcProgressPct(current, g.TargetValue)

		var estDate *string
		if g.GoalType != "competition" {
			est, err := utils.EstimateAchieveDate(database.DB, userID, g.GoalType, g.TargetValue)
			if err == nil && est != nil {
				s := est.Format("2006-01-02")
				estDate = &s
			}
		}

		daysRem := 0
		if g.TargetDate != nil {
			daysRem = utils.DaysRemaining(*g.TargetDate)
		}

		result = append(result, GoalWithProgress{
			UserGoal:      g,
			CurrentValue:  math.Round(current*100) / 100,
			ProgressPct:   pct,
			EstimatedDate: estDate,
			DaysRemaining: daysRem,
		})
	}

	return utils.SuccessResponse(c, 200, "Goal progress retrieved", result)
}

func AchieveGoal(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid ID")
	}

	var goal models.UserGoal
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&goal); result.Error != nil {
		return utils.ErrorResponse(c, 404, "Goal not found")
	}

	today := time.Now().Format("2006-01-02")
	database.DB.Model(&goal).Select("is_achieved", "achieved_at", "updated_at").
		Updates(map[string]interface{}{
			"is_achieved": true,
			"achieved_at": today,
		})

	database.DB.Where("id = ? AND user_id = ?", id, userID).First(&goal)
	return utils.SuccessResponse(c, 200, "Goal marked as achieved", goal)
}
