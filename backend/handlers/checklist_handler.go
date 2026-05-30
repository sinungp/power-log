package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
)

func GetChecklists(c *fiber.Ctx) error {
	var checklists []models.Checklist
	query := database.DB

	if checklistType := c.Query("type"); checklistType != "" {
		query = query.Where("type = ?", checklistType)
	}

	if result := query.Order("type, id").Find(&checklists); result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to fetch checklists")
	}

	return utils.SuccessResponse(c, 200, "Checklists retrieved", checklists)
}

type ChecklistLogInput struct {
	ChecklistID uint `json:"checklist_id" validate:"required"`
	IsDone      bool `json:"is_done"`
}

func CreateChecklistLog(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input ChecklistLogInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	log := models.UserChecklistLog{
		UserID:      userID,
		ChecklistID: input.ChecklistID,
		IsDone:      input.IsDone,
		LoggedAt:    time.Now(),
	}

	// upsert: update if exists for same user+checklist+date
	var existing models.UserChecklistLog
	result := database.DB.Where("user_id = ? AND checklist_id = ? AND logged_at = ?",
		userID, input.ChecklistID, time.Now().Format("2006-01-02")).
		First(&existing)

	if result.Error == nil {
		existing.IsDone = input.IsDone
		database.DB.Save(&existing)
		return utils.SuccessResponse(c, 200, "Checklist log updated", existing)
	}

	if result := database.DB.Create(&log); result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to create checklist log")
	}

	return utils.SuccessResponse(c, 201, "Checklist log created", log)
}

func GetChecklistLogs(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	dateStr := c.Query("date", time.Now().Format("2006-01-02"))
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return utils.ErrorResponse(c, 422, "Invalid date format, use YYYY-MM-DD")
	}

	var logs []models.UserChecklistLog
	if result := database.DB.Where("user_id = ? AND logged_at = ?", userID, date.Format("2006-01-02")).
		Find(&logs); result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to fetch checklist logs")
	}

	return utils.SuccessResponse(c, 200, "Checklist logs retrieved", logs)
}
