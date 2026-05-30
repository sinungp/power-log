package models

import "time"

type RecoveryLog struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID       uint      `gorm:"not null;uniqueIndex:uq_user_date" json:"user_id"`
	LoggedAt     string    `gorm:"type:date;not null;uniqueIndex:uq_user_date" json:"logged_at"`
	SleepHours   float64   `gorm:"type:decimal(4,1);not null" json:"sleep_hours"`
	SleepQuality uint      `gorm:"type:tinyint unsigned;not null" json:"sleep_quality"`
	StressLevel  uint      `gorm:"type:tinyint unsigned;not null" json:"stress_level"`
	DomsLevel    *uint     `gorm:"type:tinyint unsigned" json:"doms_level,omitempty"`
	Notes        *string   `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}
