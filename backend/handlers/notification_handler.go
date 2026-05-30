package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
)

type PrefInput struct {
	ReminderRecovery     bool   `json:"reminder_recovery"`
	ReminderRecoveryTime string `json:"reminder_recovery_time" validate:"omitempty,len=8"`
	ReminderLift         bool   `json:"reminder_lift"`
	ReminderLiftDays     string `json:"reminder_lift_days" validate:"omitempty"`
	TelegramChatID       string `json:"telegram_chat_id" validate:"omitempty"`
}

func GetNotifications(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	unreadOnly := c.Query("unread_only") == "true"

	query := database.DB.Where("user_id = ?", userID)
	if unreadOnly {
		query = query.Where("is_read = ?", false)
	}

	var notifications []models.Notification
	query.Order("sent_at DESC").Limit(limit).Find(&notifications)

	var unreadCount int64
	database.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&unreadCount)

	return utils.SuccessResponse(c, 200, "Notifications retrieved", fiber.Map{
		"notifications": notifications,
		"unread_count":  unreadCount,
	})
}

func MarkNotificationRead(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid ID")
	}

	result := database.DB.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", id, userID).
		Update("is_read", true)
	if result.RowsAffected == 0 {
		return utils.ErrorResponse(c, 404, "Notification not found")
	}

	return utils.SuccessResponse(c, 200, "Marked as read", nil)
}

func MarkAllNotificationsRead(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	database.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Update("is_read", true)

	return utils.SuccessResponse(c, 200, "All notifications marked as read", nil)
}

func GetNotificationPreferences(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var pref models.NotificationPreference
	result := database.DB.Where("user_id = ?", userID).First(&pref)
	if result.Error != nil {
		return utils.SuccessResponse(c, 200, "Default preferences", fiber.Map{
			"reminder_recovery":      true,
			"reminder_recovery_time": "20:00:00",
			"reminder_lift":         true,
			"reminder_lift_days":    "1,3,5",
			"telegram_chat_id":      nil,
		})
	}

	return utils.SuccessResponse(c, 200, "Notification preferences", pref)
}

func UpdateNotificationPreferences(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input PrefInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	var pref models.NotificationPreference
	result := database.DB.Where("user_id = ?", userID).First(&pref)
	if result.Error != nil {
		pref = models.NotificationPreference{UserID: userID}
	}

	pref.ReminderRecovery = input.ReminderRecovery
	if input.ReminderRecoveryTime != "" {
		pref.ReminderRecoveryTime = input.ReminderRecoveryTime
	}
	pref.ReminderLift = input.ReminderLift
	if input.ReminderLiftDays != "" {
		pref.ReminderLiftDays = input.ReminderLiftDays
	}
	if input.TelegramChatID != "" {
		pref.TelegramChatID = &input.TelegramChatID
	} else {
		pref.TelegramChatID = nil
	}

	if result.Error != nil {
		database.DB.Create(&pref)
	} else {
		database.DB.Save(&pref)
	}

	return utils.SuccessResponse(c, 200, "Preferences updated", pref)
}
