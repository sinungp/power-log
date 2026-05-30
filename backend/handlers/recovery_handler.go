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
	"gorm.io/gorm/clause"
)

type RecoveryInput struct {
	LoggedAt     string  `json:"logged_at" validate:"required"`
	SleepHours   float64 `json:"sleep_hours" validate:"required,min=1,max=24"`
	SleepQuality uint    `json:"sleep_quality" validate:"required,min=1,max=10"`
	StressLevel  uint    `json:"stress_level" validate:"required,min=1,max=10"`
	DomsLevel    *uint   `json:"doms_level" validate:"omitempty,min=1,max=5"`
	Notes        string  `json:"notes"`
}

func GetRecoveryLogs(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	days, _ := strconv.Atoi(c.Query("days", "7"))
	if days > 30 {
		days = 30
	}
	if days < 1 {
		days = 7
	}

	startDate := time.Now().AddDate(0, 0, -days+1).Format("2006-01-02")

	var logs []models.RecoveryLog
	result := database.DB.Where("user_id = ? AND logged_at >= ?", userID, startDate).
		Order("logged_at ASC").
		Find(&logs)
	if result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to fetch recovery logs")
	}

	// Calculate averages
	var totalSleepHours, totalSleepQuality, totalStressLevel float64
	var domsCount float64
	var totalDoms float64
	for _, l := range logs {
		totalSleepHours += l.SleepHours
		totalSleepQuality += float64(l.SleepQuality)
		totalStressLevel += float64(l.StressLevel)
		if l.DomsLevel != nil {
			totalDoms += float64(*l.DomsLevel)
			domsCount++
		}
	}
	n := float64(len(logs))
	avg := fiber.Map{
		"avg_sleep_hours":  0,
		"avg_sleep_quality": 0,
		"avg_stress_level":  0,
		"avg_doms_level":    0,
	}
	if n > 0 {
		avg["avg_sleep_hours"] = math.Round(totalSleepHours/n*10) / 10
		avg["avg_sleep_quality"] = math.Round(totalSleepQuality/n*10) / 10
		avg["avg_stress_level"] = math.Round(totalStressLevel/n*10) / 10
		if domsCount > 0 {
			avg["avg_doms_level"] = math.Round(totalDoms/domsCount*10) / 10
		}
	}

	return utils.SuccessResponse(c, 200, "Recovery logs retrieved", fiber.Map{
		"logs":   logs,
		"averages": avg,
	})
}

func CreateRecoveryLog(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input RecoveryInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	v := validator.New()
	if err := v.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	log := models.RecoveryLog{
		UserID:       userID,
		LoggedAt:     input.LoggedAt,
		SleepHours:   input.SleepHours,
		SleepQuality: input.SleepQuality,
		StressLevel:  input.StressLevel,
	}
	if input.DomsLevel != nil {
		log.DomsLevel = input.DomsLevel
	}
	if input.Notes != "" {
		log.Notes = &input.Notes
	}

	result := database.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "logged_at"}},
		DoUpdates: clause.AssignmentColumns([]string{"sleep_hours", "sleep_quality", "stress_level", "doms_level", "notes"}),
	}).Create(&log)
	if result.Error != nil {
		return utils.ErrorResponse(c, 500, "Failed to save recovery log")
	}

	return utils.SuccessResponse(c, 201, "Recovery log saved", log)
}

func UpdateRecoveryLog(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid id")
	}

	var input RecoveryInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	var log models.RecoveryLog
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&log); result.Error != nil {
		return utils.ErrorResponse(c, 404, "Recovery log not found")
	}

	log.LoggedAt = input.LoggedAt
	log.SleepHours = input.SleepHours
	log.SleepQuality = input.SleepQuality
	log.StressLevel = input.StressLevel
	log.DomsLevel = input.DomsLevel
	if input.Notes != "" {
		log.Notes = &input.Notes
	} else {
		log.Notes = nil
	}

	database.DB.Save(&log)
	return utils.SuccessResponse(c, 200, "Recovery log updated", log)
}

func DeleteRecoveryLog(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid id")
	}

	result := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.RecoveryLog{})
	if result.RowsAffected == 0 {
		return utils.ErrorResponse(c, 404, "Recovery log not found")
	}

	return utils.SuccessResponse(c, 200, "Recovery log deleted", nil)
}

func GetRecoverySummary(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	weeks, _ := strconv.Atoi(c.Query("weeks", "4"))
	if weeks > 12 {
		weeks = 12
	}
	if weeks < 1 {
		weeks = 4
	}

	totalDays := weeks * 7
	startDate := time.Now().AddDate(0, 0, -totalDays+1).Format("2006-01-02")

	var logs []models.RecoveryLog
	database.DB.Where("user_id = ? AND logged_at >= ?", userID, startDate).
		Order("logged_at ASC").
		Find(&logs)

	if len(logs) == 0 {
		return utils.SuccessResponse(c, 200, "Recovery summary", fiber.Map{
			"avg_sleep_hours":  0,
			"avg_sleep_quality": 0,
			"avg_stress_level":  0,
			"avg_doms_level":    0,
			"recovery_score":    0,
			"trend":             "stable",
		})
	}

	// Split into recent (last 7 days) and previous (7 days before that)
	cutoff := time.Now().AddDate(0, 0, -7).Format("2006-01-02")
	var recent, previous []models.RecoveryLog
	for _, l := range logs {
		if l.LoggedAt >= cutoff {
			recent = append(recent, l)
		} else {
			previous = append(previous, l)
		}
	}

	calcAvg := func(logs []models.RecoveryLog) (sleepH, sleepQ, stress, doms float64) {
		n := float64(len(logs))
		if n == 0 {
			return
		}
		var dCount float64
		for _, l := range logs {
			sleepH += l.SleepHours
			sleepQ += float64(l.SleepQuality)
			stress += float64(l.StressLevel)
			if l.DomsLevel != nil {
				doms += float64(*l.DomsLevel)
				dCount++
			}
		}
		sleepH = math.Round(sleepH/n*10) / 10
		sleepQ = math.Round(sleepQ/n*10) / 10
		stress = math.Round(stress/n*10) / 10
		if dCount > 0 {
			doms = math.Round(doms/dCount*10) / 10
		}
		return
	}

	recentAvgSH, recentAvgSQ, recentAvgSL, recentAvgD := calcAvg(recent)
	prevAvgSH, prevAvgSQ, prevAvgSL, prevAvgD := calcAvg(previous)

	scoreRecent := utils.CalculateRecoveryScore(utils.RecoveryScoreInput{
		SleepHours:   recentAvgSH,
		SleepQuality: uint(recentAvgSQ),
		StressLevel:  uint(recentAvgSL),
		DomsLevel:    uintPtr(uint(recentAvgD)),
	})

	scorePrev := utils.CalculateRecoveryScore(utils.RecoveryScoreInput{
		SleepHours:   prevAvgSH,
		SleepQuality: uint(prevAvgSQ),
		StressLevel:  uint(prevAvgSL),
		DomsLevel:    uintPtr(uint(prevAvgD)),
	})

	trend := utils.DetermineRecoveryTrend(scoreRecent, scorePrev)

	return utils.SuccessResponse(c, 200, "Recovery summary", fiber.Map{
		"avg_sleep_hours":  recentAvgSH,
		"avg_sleep_quality": recentAvgSQ,
		"avg_stress_level":  recentAvgSL,
		"avg_doms_level":    recentAvgD,
		"recovery_score":    scoreRecent,
		"trend":             trend,
	})
}

func uintPtr(v uint) *uint {
	return &v
}
