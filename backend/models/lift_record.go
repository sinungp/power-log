package models

import (
	"time"

	"gorm.io/gorm"
)

type LiftRecord struct {
	ID        uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint           `gorm:"not null;index" json:"user_id"`
	LiftType  string         `gorm:"type:enum('squat','bench','deadlift');not null" json:"lift_type"`
	WeightKg  float64        `gorm:"type:decimal(6,2);not null" json:"weight_kg"`
	Reps      uint           `gorm:"type:tinyint unsigned;not null" json:"reps"`
	RPE       *float64       `gorm:"type:decimal(3,1)" json:"rpe,omitempty"`
	Notes     *string        `gorm:"type:text" json:"notes,omitempty"`
	LiftedAt  time.Time      `gorm:"type:date;not null" json:"lifted_at"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
