package handlers

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
)

var defaultWidgets = map[string]bool{
	"pr_summary":     true,
	"weekly_volume":  true,
	"recovery_score": true,
	"goal_progress":  true,
	"recommendation": true,
	"wilks_score":    false,
	"weight_class":   false,
	"lift_ratio":     true,
}

type WidgetInput struct {
	Widgets map[string]bool `json:"widgets"`
}

func GetDashboardConfig(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var config models.UserDashboardConfig
	result := database.DB.Where("user_id = ?", userID).First(&config)
	if result.Error != nil {
		return utils.SuccessResponse(c, 200, "Default dashboard config", fiber.Map{
			"widgets": defaultWidgets,
		})
	}

	var widgets map[string]bool
	if err := json.Unmarshal([]byte(config.Widgets), &widgets); err != nil {
		return utils.SuccessResponse(c, 200, "Default dashboard config", fiber.Map{
			"widgets": defaultWidgets,
		})
	}

	return utils.SuccessResponse(c, 200, "Dashboard config retrieved", fiber.Map{
		"widgets": widgets,
	})
}

func UpdateDashboardConfig(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input WidgetInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	merged := make(map[string]bool)
	for k, v := range defaultWidgets {
		merged[k] = v
	}
	for k, v := range input.Widgets {
		merged[k] = v
	}

	jsonBytes, err := json.Marshal(merged)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Failed to serialize widgets")
	}

	var config models.UserDashboardConfig
	result := database.DB.Where("user_id = ?", userID).First(&config)
	if result.Error != nil {
		config = models.UserDashboardConfig{
			UserID:  userID,
			Widgets: string(jsonBytes),
		}
		database.DB.Create(&config)
	} else {
		config.Widgets = string(jsonBytes)
		database.DB.Save(&config)
	}

	return utils.SuccessResponse(c, 200, "Dashboard config updated", fiber.Map{
		"widgets": merged,
	})
}
