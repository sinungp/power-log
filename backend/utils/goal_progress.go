package utils

import (
	"math"
	"time"

	"github.com/sinun/powerlog-backend/models"
	"gorm.io/gorm"
)

func GetCurrentValue(db *gorm.DB, userID uint, goalType string) (float64, error) {
	switch goalType {
	case "squat_1rm":
		return latestEst1RM(db, userID, "squat")
	case "bench_1rm":
		return latestEst1RM(db, userID, "bench")
	case "deadlift_1rm":
		return latestEst1RM(db, userID, "deadlift")
	case "body_weight":
		var bw models.BodyWeightLog
		if err := db.Where("user_id = ?", userID).Order("logged_at DESC").First(&bw).Error; err != nil {
			return 0, err
		}
		return bw.WeightKg, nil
	case "competition":
		return 0, nil
	}
	return 0, nil
}

func latestEst1RM(db *gorm.DB, userID uint, liftType string) (float64, error) {
	var record models.LiftRecord
	err := db.Where("user_id = ? AND lift_type = ?", userID, liftType).
		Order("lifted_at DESC").
		First(&record).Error
	if err != nil {
		return 0, err
	}
	return record.WeightKg * (1 + float64(record.Reps)/30.0), nil
}

func CalcProgressPct(current, target float64) float64 {
	if target <= 0 {
		return 0
	}
	pct := (current / target) * 100
	if pct > 100 {
		pct = 100
	}
	return math.Round(pct*100) / 100
}

func EstimateAchieveDate(db *gorm.DB, userID uint, goalType string, target float64) (*time.Time, error) {
	daysBack := 30
	startDate := time.Now().AddDate(0, 0, -daysBack).Format("2006-01-02")

	liftTypeMap := map[string]string{
		"squat_1rm":   "squat",
		"bench_1rm":   "bench",
		"deadlift_1rm": "deadlift",
	}
	liftType, ok := liftTypeMap[goalType]
	if !ok {
		return nil, nil
	}

	type EstRow struct {
		LiftedAt string
		Est1RM   float64
	}
	var rows []EstRow
	db.Raw(`
		SELECT lifted_at, (weight_kg * (1 + reps / 30.0)) AS est_1rm
		FROM lift_records
		WHERE user_id = ? AND lift_type = ? AND lifted_at >= ? AND deleted_at IS NULL
		ORDER BY lifted_at ASC
	`, userID, liftType, startDate).Scan(&rows)

	if len(rows) < 2 {
		return nil, nil
	}

	oldest := rows[0]
	latest := rows[len(rows)-1]
	currentVal := latest.Est1RM

	if currentVal <= 0 || oldest.Est1RM <= 0 {
		return nil, nil
	}

	rate := (currentVal - oldest.Est1RM) / float64(daysBack)
	if rate <= 0 {
		return nil, nil
	}

	daysNeeded := (target - currentVal) / rate
	if daysNeeded <= 0 {
		return nil, nil
	}

	estDate := time.Now().AddDate(0, 0, int(math.Ceil(daysNeeded)))
	return &estDate, nil
}

func DaysRemaining(targetDateStr string) int {
	t, err := time.Parse("2006-01-02", targetDateStr)
	if err != nil {
		return 0
	}
	days := int(time.Until(t).Hours() / 24)
	if days < 0 {
		return 0
	}
	return days
}
