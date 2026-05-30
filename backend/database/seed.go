package database

import (
	"github.com/sinun/powerlog-backend/models"
	"gorm.io/gorm"
)

func Seed(db *gorm.DB) error {
	accessories := []models.Accessory{
		{TargetLift: "squat", Name: "Goblet Squat", Description: "Target: quads, core stability", SetsReps: "3x10", Difficulty: "beginner"},
		{TargetLift: "squat", Name: "Bulgarian Split Squat", Description: "Target: quads, glutes", SetsReps: "3x8/leg", Difficulty: "intermediate"},
		{TargetLift: "squat", Name: "Leg Press", Description: "Target: quads", SetsReps: "4x10-12", Difficulty: "beginner"},
		{TargetLift: "squat", Name: "Romanian Deadlift", Description: "Target: hamstrings, glutes", SetsReps: "3x10", Difficulty: "intermediate"},
		{TargetLift: "squat", Name: "Box Squat", Description: "Target: squat technique, posterior chain", SetsReps: "4x5", Difficulty: "intermediate"},
		{TargetLift: "bench", Name: "Dumbbell Flye", Description: "Target: chest stretch", SetsReps: "3x12", Difficulty: "beginner"},
		{TargetLift: "bench", Name: "Close Grip Bench Press", Description: "Target: triceps", SetsReps: "3x8", Difficulty: "intermediate"},
		{TargetLift: "bench", Name: "Incline Dumbbell Press", Description: "Target: upper chest", SetsReps: "3x10", Difficulty: "beginner"},
		{TargetLift: "bench", Name: "Face Pull", Description: "Target: rear delt, shoulder health", SetsReps: "3x15", Difficulty: "beginner"},
		{TargetLift: "bench", Name: "Tricep Pushdown", Description: "Target: triceps", SetsReps: "3x12", Difficulty: "beginner"},
		{TargetLift: "deadlift", Name: "Romanian Deadlift", Description: "Target: hamstrings", SetsReps: "3x10", Difficulty: "beginner"},
		{TargetLift: "deadlift", Name: "Deficit Deadlift", Description: "Target: pull mechanics", SetsReps: "3x5", Difficulty: "advanced"},
		{TargetLift: "deadlift", Name: "Barbell Row", Description: "Target: upper back", SetsReps: "4x8", Difficulty: "intermediate"},
		{TargetLift: "deadlift", Name: "Hip Thrust", Description: "Target: glutes", SetsReps: "3x12", Difficulty: "beginner"},
		{TargetLift: "deadlift", Name: "Farmer Walk", Description: "Target: grip, core", SetsReps: "3x30m", Difficulty: "beginner"},
	}

	checklists := []models.Checklist{
		{Type: "warmup", Name: "5 menit cardio ringan (jalan/sepeda statis)", DurationSec: uintPtr(300)},
		{Type: "warmup", Name: "Hip circle 10 reps per sisi", DurationSec: uintPtr(60)},
		{Type: "warmup", Name: "Leg swing 10 reps per sisi", DurationSec: uintPtr(60)},
		{Type: "warmup", Name: "Band pull apart 15 reps", DurationSec: uintPtr(45)},
		{Type: "warmup", Name: "Cat-cow stretch 10 reps", DurationSec: uintPtr(30)},
		{Type: "warmup", Name: "Empty bar squat 2x10", DurationSec: uintPtr(90)},
		{Type: "warmup", Name: "Activation glute bridge 15 reps", DurationSec: uintPtr(45)},
		{Type: "cooldown", Name: "Pigeon pose 60 detik per sisi", DurationSec: uintPtr(120)},
		{Type: "cooldown", Name: "Quad stretch 30 detik per sisi", DurationSec: uintPtr(60)},
		{Type: "cooldown", Name: "Hamstring stretch 30 detik per sisi", DurationSec: uintPtr(60)},
		{Type: "cooldown", Name: "Child's pose 60 detik", DurationSec: uintPtr(60)},
		{Type: "cooldown", Name: "Chest opener stretch 30 detik", DurationSec: uintPtr(30)},
		{Type: "cooldown", Name: "Deep breathing 5 menit", DurationSec: uintPtr(300)},
	}

	for _, acc := range accessories {
		var existing models.Accessory
		if db.Where("name = ?", acc.Name).First(&existing).Error != nil {
			db.Create(&acc)
		}
	}

	for _, cl := range checklists {
		var existing models.Checklist
		if db.Where("name = ?", cl.Name).First(&existing).Error != nil {
			db.Create(&cl)
		}
	}

	return nil
}

func uintPtr(i uint) *uint { return &i }
