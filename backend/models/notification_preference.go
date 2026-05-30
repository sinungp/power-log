package models

import "time"

type NotificationPreference struct {
	ID                  uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID              uint      `gorm:"not null;uniqueIndex" json:"user_id"`
	ReminderRecovery    bool      `gorm:"not null;default:true" json:"reminder_recovery"`
	ReminderRecoveryTime string   `gorm:"type:time;not null;default:'20:00:00'" json:"reminder_recovery_time"`
	ReminderLift        bool      `gorm:"not null;default:true" json:"reminder_lift"`
	ReminderLiftDays    string    `gorm:"type:varchar(20);not null;default:'1,3,5'" json:"reminder_lift_days"`
	TelegramChatID      *string   `gorm:"type:varchar(100)" json:"telegram_chat_id,omitempty"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}
