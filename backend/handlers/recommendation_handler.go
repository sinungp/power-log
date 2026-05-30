package handlers

import (
	"fmt"
	"math"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
)

type AIAnalysisInput struct {
	ContextWeeks int `json:"context_weeks" validate:"min=1,max=12"`
}

func GetRecommendations(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	category := c.Query("category", "")
	limit, _ := strconv.Atoi(c.Query("limit", "5"))
	if limit < 1 {
		limit = 5
	}
	if limit > 20 {
		limit = 20
	}

	query := database.DB.Where("user_id = ?", userID)
	if category != "" {
		query = query.Where("category = ?", category)
	}

	var recs []models.Recommendation
	query.Order("generated_at DESC").Limit(limit).Find(&recs)

	return utils.SuccessResponse(c, 200, "Recommendations retrieved", recs)
}

func GenerateRecommendations(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	recs, err := utils.GenerateRuleBasedRecommendations(database.DB, userID)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Failed to generate recommendations")
	}

	if recs == nil {
		recs = []models.Recommendation{}
	}

	return utils.SuccessResponse(c, 200, "Recommendations generated", recs)
}

func RequestAIAnalysis(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	// Rate limit: 1x per 24 jam
	var lastAI models.Recommendation
	result := database.DB.Where("user_id = ? AND source = 'ai'", userID).
		Order("generated_at DESC").
		First(&lastAI)
	if result.Error == nil {
		elapsed := time.Since(lastAI.GeneratedAt)
		if elapsed < 24*time.Hour {
			hoursLeft := 24 - int(elapsed.Hours())
			return utils.ErrorResponse(c, 429, fmt.Sprintf("Analisis AI tersedia lagi dalam %d jam", hoursLeft))
		}
	}

	contextWeeks := 4
	var input AIAnalysisInput
	if err := c.BodyParser(&input); err == nil && input.ContextWeeks > 0 {
		if input.ContextWeeks > 12 {
			contextWeeks = 12
		} else {
			contextWeeks = input.ContextWeeks
		}
	}

	contextData, err := buildAIContext(userID, contextWeeks)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Failed to build context data")
	}

	content, err := utils.RequestAIAnalysis(userID, contextData)
	if err != nil {
		fmt.Printf("OpenRouter error for user %d: %v\n", userID, err)
		return utils.ErrorResponse(c, 502, "Analisis AI sedang tidak tersedia, coba lagi nanti")
	}

	rec := models.Recommendation{
		UserID:    userID,
		Source:    "ai",
		Category:  "general",
		Title:     "Analisis AI Personal",
		Body:      content,
		ExpiresAt: nil,
	}
	database.DB.Create(&rec)

	return utils.SuccessResponse(c, 200, "AI analysis completed", rec)
}

func MarkRecommendationRead(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(c, 400, "Invalid ID")
	}

	result := database.DB.Model(&models.Recommendation{}).
		Where("id = ? AND user_id = ?", id, userID).
		Update("is_read", true)
	if result.RowsAffected == 0 {
		return utils.ErrorResponse(c, 404, "Recommendation not found")
	}

	return utils.SuccessResponse(c, 200, "Marked as read", nil)
}

func buildAIContext(userID uint, weeks int) (string, error) {
	startDate := time.Now().AddDate(0, 0, -(weeks*7)+1).Format("2006-01-02")

	// Experience level
	var profile models.UserProfile
	level := "beginner"
	database.DB.Where("user_id = ?", userID).First(&profile)
	if profile.ExperienceLevel != "" {
		level = profile.ExperienceLevel
	}

	// Estimate 1RMs
	type Est1RM struct {
		LiftType string
		Est1RMKg float64
	}
	var est1RMs []Est1RM
	database.DB.Raw(`
		SELECT lift_type, MAX(weight_kg * (1 + reps / 30.0)) AS est_1rm_kg
		FROM lift_records
		WHERE user_id = ? AND deleted_at IS NULL
		GROUP BY lift_type
	`, userID).Scan(&est1RMs)
	rmMap := map[string]float64{}
	for _, e := range est1RMs {
		rmMap[e.LiftType] = math.Round(e.Est1RMKg*100) / 100
	}

	// Volume
	type VolRow struct {
		TotalKg float64
	}
	var vol VolRow
	database.DB.Raw(`
		SELECT COALESCE(SUM(weight_kg * reps), 0) AS total_kg
		FROM lift_records
		WHERE user_id = ? AND lifted_at >= ? AND deleted_at IS NULL
	`, userID, startDate).Scan(&vol)

	// Recovery
	var recLogs []models.RecoveryLog
	database.DB.Where("user_id = ? AND logged_at >= ?", userID, startDate).Find(&recLogs)
	var avgSleep, avgSleepQ, avgStress float64
	n := float64(len(recLogs))
	if n > 0 {
		for _, l := range recLogs {
			avgSleep += l.SleepHours
			avgSleepQ += float64(l.SleepQuality)
			avgStress += float64(l.StressLevel)
		}
		avgSleep = math.Round(avgSleep/n*10) / 10
		avgSleepQ = math.Round(avgSleepQ/n*10) / 10
		avgStress = math.Round(avgStress/n*10) / 10
	}

	score := utils.CalculateRecoveryScore(utils.RecoveryScoreInput{
		SleepHours:   avgSleep,
		SleepQuality: uint(avgSleepQ),
		StressLevel:  uint(avgStress),
	})

	// Weakness
	var weakness string
	type LRR struct {
		Squat, Bench, Deadlift float64
	}
	var lr LRR
	database.DB.Raw(`
		SELECT
			MAX(CASE WHEN lift_type='squat' THEN weight_kg*(1+reps/30.0) END) AS squat,
			MAX(CASE WHEN lift_type='bench' THEN weight_kg*(1+reps/30.0) END) AS bench,
			MAX(CASE WHEN lift_type='deadlift' THEN weight_kg*(1+reps/30.0) END) AS deadlift
		FROM lift_records WHERE user_id = ? AND deleted_at IS NULL
	`, userID).Scan(&lr)
	if lr.Squat > 0 {
		btos := lr.Bench / lr.Squat * 100
		switch {
		case btos < 65:
			weakness = "bench"
		case lr.Deadlift/lr.Squat*100 < 110:
			weakness = "deadlift"
		case btos > 85:
			weakness = "squat"
		default:
			weakness = "balanced"
		}
	} else {
		weakness = "unknown"
	}

	// Goals
	var goals []models.UserGoal
	database.DB.Where("user_id = ? AND is_achieved = false", userID).Find(&goals)
	var goalStr string
	for _, g := range goals {
		current, _ := utils.GetCurrentValue(database.DB, userID, g.GoalType)
		pct := utils.CalcProgressPct(current, g.TargetValue)
		goalStr += fmt.Sprintf("- %s: %.1f/%.1fkg (%.0f%%)\n", g.GoalType, current, g.TargetValue, pct)
	}
	if goalStr == "" {
		goalStr = "Tidak ada goal aktif"
	}

	// Rule-based recs
	var ruleRecs []models.Recommendation
	database.DB.Where("user_id = ? AND source = 'rule' AND expires_at > ?", userID, time.Now()).
		Limit(3).Find(&ruleRecs)
	var ruleStr string
	for _, r := range ruleRecs {
		ruleStr += fmt.Sprintf("- [%s] %s\n", r.Category, r.Title)
	}
	if ruleStr == "" {
		ruleStr = "Tidak ada rekomendasi rule-based saat ini"
	}

	context := fmt.Sprintf(`Berikut data atlet powerlifting saya selama %d minggu terakhir:
- Level: %s
- Estimasi 1RM: Squat %.1fkg | Bench %.1fkg | Deadlift %.1fkg
- Volume mingguan rata-rata: %.0fkg total
- Recovery score rata-rata: %.1f/100
- Rata-rata tidur: %.1f jam, kualitas %.1f/10
- Rata-rata stres: %.1f/10
- Kelemahan terdeteksi: %s
- Goal aktif: %s
- Rekomendasi rule-based saat ini: %s

Berikan analisis dan 2-3 rekomendasi program spesifik untuk minggu depan.`,
		weeks, level, rmMap["squat"], rmMap["bench"], rmMap["deadlift"],
		vol.TotalKg/float64(weeks), score, avgSleep, avgSleepQ, avgStress,
		weakness, goalStr, ruleStr)

	return context, nil
}
