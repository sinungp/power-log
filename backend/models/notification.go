package models

import "time"

type Notification struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Type      string    `gorm:"type:enum('reminder_recovery','reminder_lift','goal_achieved','goal_near','competition_countdown','general');not null" json:"type"`
	Title     string    `gorm:"type:varchar(200);not null" json:"title"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	IsRead    bool      `gorm:"not null;default:false" json:"is_read"`
	SentAt    time.Time `json:"sent_at"`
}
