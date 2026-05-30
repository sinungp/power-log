package models

import "time"

type BodyWeightLog struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint      `gorm:"not null;uniqueIndex:uq_user_date" json:"user_id"`
	WeightKg  float64   `gorm:"type:decimal(5,2);not null" json:"weight_kg"`
	LoggedAt  string    `gorm:"type:date;not null;uniqueIndex:uq_user_date" json:"logged_at"`
	Notes     *string   `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
