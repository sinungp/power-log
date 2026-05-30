package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"type:varchar(100);not null" json:"name"`
	Email     string    `gorm:"type:varchar(150);uniqueIndex;not null" json:"email"`
	Password  *string   `gorm:"type:varchar(255)" json:"-"`
	Plan      string    `gorm:"type:enum('free','pro');default:'free'" json:"plan"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
