package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
)

func GetAccessories(c *fiber.Ctx) error {
	var accessories []models.Accessory
	query := database.DB

	if target := c.Query("target"); target != "" {
		query = query.Where("target_lift = ?", target)
	}

	if difficulty := c.Query("difficulty"); difficulty != "" {
		query = query.Where("difficulty = ?", difficulty)
	}

	if result := query.Order("target_lift, difficulty").Find(&accessories); result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to fetch accessories")
	}

	return utils.SuccessResponse(c, 200, "Accessories retrieved", accessories)
}
