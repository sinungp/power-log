package jobs

import (
	"log"
	"time"

	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
	"gorm.io/gorm"
)

func CheckGoals(db *gorm.DB) {
	log.Println("Running goal check job...")

	var goals []models.UserGoal
	db.Where("is_achieved = ?", false).
		Find(&goals)

	today := time.Now().Format("2006-01-02")

	for _, goal := range goals {
		current, err := utils.GetCurrentValue(db, goal.UserID, goal.GoalType)
		if err != nil || current <= 0 {
			continue
		}

		if current >= goal.TargetValue {
			goal.IsAchieved = true
			goal.AchievedAt = &today
			db.Save(&goal)

			goalLabel := map[string]string{
				"squat_1rm": "Squat 1RM", "bench_1rm": "Bench 1RM",
				"deadlift_1rm": "Deadlift 1RM", "body_weight": "Berat Badan",
				"competition": "Kompetisi",
			}
			label := goalLabel[goal.GoalType]
			if label == "" {
				label = goal.GoalType
			}

			notif := models.Notification{
				UserID:  goal.UserID,
				Type:    "goal_achieved",
				Title:   "Goal tercapai! 🎉",
				Message: "Selamat! Goal " + label + " kamu telah tercapai.",
			}
			db.Create(&notif)
		}
	}
}
