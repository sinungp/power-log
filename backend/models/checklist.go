package models

import "time"

type Checklist struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Type        string `gorm:"type:enum('warmup','cooldown');not null" json:"type"`
	Name        string `gorm:"type:varchar(150);not null" json:"name"`
	Description string `gorm:"type:text" json:"description,omitempty"`
	DurationSec *uint  `grom:"type:int unsigned" json:"duration_sec,omitempty"`
}

type UserChecklistLog struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	ChecklistID uint      `gorm:"not null" json:"checklist_id"`
	IsDone      bool      `gorm:"default:false" json:"is_done"`
	LoggedAt    time.Time `gorm:"type:date;not null" json:"logged_at"`
}
