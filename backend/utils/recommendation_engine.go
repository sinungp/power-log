package utils

import (
	"fmt"
	"math"
	"time"

	"github.com/sinun/powerlog-backend/models"
	"gorm.io/gorm"
)

func GenerateRuleBasedRecommendations(db *gorm.DB, userID uint) ([]models.Recommendation, error) {
	var results []models.Recommendation
	now := time.Now()
	expiresAt := now.Add(7 * 24 * time.Hour)

	// Check existing non-expired recommendations for duplicate prevention
	type existingKey struct {
		Category string
	}
	var existingRecs []models.Recommendation
	db.Where("user_id = ? AND expires_at > ? AND source = 'rule'", userID, now).Find(&existingRecs)
	exists := map[existingKey]bool{}
	for _, r := range existingRecs {
		exists[existingKey{Category: r.Category}] = true
	}

	shouldInsert := func(category string) bool {
		return !exists[existingKey{Category: category}]
	}

	// RULE 1: Recovery buruk
	var recentRecovery []models.RecoveryLog
	db.Where("user_id = ? AND logged_at >= ?", userID, now.AddDate(0, 0, -3).Format("2006-01-02")).
		Find(&recentRecovery)
	if len(recentRecovery) >= 3 {
		var sum float64
		for _, l := range recentRecovery {
			score := CalculateRecoveryScore(RecoveryScoreInput{
				SleepHours:   l.SleepHours,
				SleepQuality: l.SleepQuality,
				StressLevel:  l.StressLevel,
				DomsLevel:    l.DomsLevel,
			})
			sum += score
		}
		avgScore := sum / 3
		if avgScore < 50 && shouldInsert("recovery") {
			results = append(results, models.Recommendation{
				UserID:    userID,
				Source:    "rule",
				Category:  "recovery",
				Title:     "Recovery kamu sedang rendah",
				Body:      "Rata-rata recovery score kamu 3 hari terakhir di bawah 50. Pertimbangkan untuk mengurangi volume latihan minggu ini sebesar 20-30% dan prioritaskan tidur minimal 8 jam.",
				ExpiresAt: &expiresAt,
			})
		}
	}

	// RULE 2: Volume plateau
	if shouldInsert("volume") {
		type VolRow struct {
			Week  string
			VolKg float64
		}
		var vols []VolRow
		db.Raw(`
			SELECT DATE_FORMAT(lifted_at, '%Y-%u') AS week,
				SUM(weight_kg * reps) AS vol_kg
			FROM lift_records
			WHERE user_id = ? AND deleted_at IS NULL
			GROUP BY week
			ORDER BY week DESC
			LIMIT 3
		`, userID).Scan(&vols)

		if len(vols) >= 3 {
			thisWeek := vols[0].VolKg
			prevWeek := vols[2].VolKg
			if prevWeek > 0 && thisWeek <= prevWeek*1.02 {
				var avgRecovery float64
				var recCount int
				for _, l := range recentRecovery {
					score := CalculateRecoveryScore(RecoveryScoreInput{
						SleepHours:   l.SleepHours,
						SleepQuality: l.SleepQuality,
						StressLevel:  l.StressLevel,
						DomsLevel:    l.DomsLevel,
					})
					if score > 60 {
						avgRecovery += score
						recCount++
					}
				}
				if recCount > 0 && avgRecovery/float64(recCount) > 60 {
					results = append(results, models.Recommendation{
						UserID:    userID,
						Source:    "rule",
						Category:  "volume",
						Title:     "Volume latihan kamu stagnan",
						Body:      "Volume minggu ini tidak meningkat signifikan padahal recovery kamu baik. Coba tambahkan 1 set di lift utama atau naikkan berat 2.5kg.",
						ExpiresAt: &expiresAt,
					})
				}
			}
		}
	}

	// RULE 3: Weakness detection
	if shouldInsert("weakness") {
		type Est1RM struct {
			LiftType string
			Est1RMKg float64
		}
		var est1RMs []Est1RM
		db.Raw(`
			SELECT lift_type, MAX(weight_kg * (1 + reps / 30.0)) AS est_1rm_kg
			FROM lift_records
			WHERE user_id = ? AND deleted_at IS NULL
			GROUP BY lift_type
		`, userID).Scan(&est1RMs)

		estMap := map[string]float64{}
		for _, e := range est1RMs {
			estMap[e.LiftType] = math.Round(e.Est1RMKg*100) / 100
		}
		squat := estMap["squat"]
		bench := estMap["bench"]
		deadlift := estMap["deadlift"]

		if squat > 0 {
			btos := math.Round(bench/squat*10000) / 100
			dtos := math.Round(deadlift/squat*10000) / 100

			var weaknessLift, note string
			switch {
			case btos > 0 && btos < 65:
				weaknessLift = "bench"
				note = "Rasio bench press kamu berada di luar range ideal. Tambahkan 1-2 sesi aksesori khusus bench per minggu selama 4-6 minggu ke depan."
			case dtos > 0 && dtos < 110:
				weaknessLift = "deadlift"
				note = "Rasio deadlift kamu berada di luar range ideal. Tambahkan 1-2 sesi aksesori khusus deadlift per minggu selama 4-6 minggu ke depan."
			case btos > 85:
				weaknessLift = "squat"
				note = "Rasio squat kamu berada di luar range ideal. Tambahkan 1-2 sesi aksesori khusus squat per minggu selama 4-6 minggu ke depan."
			}
			if weaknessLift != "" {
				results = append(results, models.Recommendation{
					UserID:    userID,
					Source:    "rule",
					Category:  "weakness",
					Title:     fmt.Sprintf("Terdeteksi kelemahan di lift %s", weaknessLift),
					Body:      note,
					ExpiresAt: &expiresAt,
				})
			}
		}
	}

	// RULE 4: Approaching competition
	if shouldInsert("peaking") {
		var compGoals []models.UserGoal
		db.Where("user_id = ? AND goal_type = 'competition' AND is_achieved = false", userID).Find(&compGoals)
		for _, g := range compGoals {
			if g.TargetDate == nil {
				continue
			}
			t, err := time.Parse("2006-01-02", *g.TargetDate)
			if err != nil {
				continue
			}
			daysLeft := int(time.Until(t).Hours() / 24)
			if daysLeft > 0 && daysLeft <= 28 {
				compName := "Kompetisi"
				if g.CompetitionName != nil {
					compName = *g.CompetitionName
				}
				results = append(results, models.Recommendation{
					UserID:    userID,
					Source:    "rule",
					Category:  "peaking",
					Title:     fmt.Sprintf("%s tinggal %d hari lagi", compName, daysLeft),
					Body:      "Saatnya masuk fase peaking. Kurangi volume 40%, pertahankan intensitas tinggi (>85% 1RM), dan mulai latihan attempt selection.",
					ExpiresAt: &expiresAt,
				})
			}
		}
	}

	// RULE 5: Goal near
	if shouldInsert("general") {
		var goals []models.UserGoal
		db.Where("user_id = ? AND is_achieved = false", userID).Find(&goals)
		for _, g := range goals {
			current, err := GetCurrentValue(db, userID, g.GoalType)
			if err != nil || current <= 0 {
				continue
			}
			pct := CalcProgressPct(current, g.TargetValue)
			if pct >= 90 {
				goalLabel := map[string]string{
					"squat_1rm": "Squat 1RM", "bench_1rm": "Bench 1RM",
					"deadlift_1rm": "Deadlift 1RM", "body_weight": "Berat Badan",
				}
				label := goalLabel[g.GoalType]
				if label == "" {
					label = g.GoalType
				}
				remaining := g.TargetValue - current
				results = append(results, models.Recommendation{
					UserID:    userID,
					Source:    "rule",
					Category:  "general",
					Title:     fmt.Sprintf("Goal %s hampir tercapai!", label),
					Body:      fmt.Sprintf("Kamu sudah mencapai %.1f%% dari target %s. Jaga konsistensi, kamu tinggal %.1f kg lagi dari target.", pct, label, remaining),
					ExpiresAt: &expiresAt,
				})
			}
		}
	}

	// RULE 6: Tidak ada data recovery 3 hari terakhir
	if shouldInsert("recovery") && len(recentRecovery) == 0 {
		results = append(results, models.Recommendation{
			UserID:    userID,
			Source:    "rule",
			Category:  "recovery",
			Title:     "Kamu belum mencatat recovery hari ini",
			Body:      "Catat tidur dan stres harianmu agar sistem bisa memberikan rekomendasi yang lebih akurat.",
			ExpiresAt: &expiresAt,
		})
	}

	// Insert new recommendations
	for i := range results {
		db.Create(&results[i])
	}

	// Cleanup expired
	db.Where("user_id = ? AND expires_at < ?", userID, now).Delete(&models.Recommendation{})

	return results, nil
}
