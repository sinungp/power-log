package models

import "time"

type Recommendation struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	Source      string    `gorm:"type:enum('rule','ai');not null" json:"source"`
	Category    string    `gorm:"type:enum('volume','recovery','weakness','peaking','general');not null" json:"category"`
	Title       string    `gorm:"type:varchar(200);not null" json:"title"`
	Body        string    `gorm:"type:text;not null" json:"body"`
	IsRead      bool      `gorm:"not null;default:false" json:"is_read"`
	GeneratedAt time.Time `json:"generated_at"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
}
