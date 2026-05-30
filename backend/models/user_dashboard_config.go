package models

import "time"

type UserDashboardConfig struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint      `gorm:"not null;uniqueIndex" json:"user_id"`
	Widgets   string    `gorm:"type:json;not null" json:"widgets"`
	UpdatedAt time.Time `json:"updated_at"`
}
