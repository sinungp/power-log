package models

import "time"

type UserGoal struct {
	ID              uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID          uint      `gorm:"not null;index" json:"user_id"`
	GoalType        string    `gorm:"type:enum('squat_1rm','bench_1rm','deadlift_1rm','body_weight','competition');not null" json:"goal_type"`
	TargetValue     float64   `gorm:"type:decimal(8,2);not null" json:"target_value"`
	TargetDate      *string   `gorm:"type:date" json:"target_date,omitempty"`
	CompetitionName *string   `gorm:"type:varchar(200)" json:"competition_name,omitempty"`
	Federation      *string   `gorm:"type:varchar(100)" json:"federation,omitempty"`
	IsAchieved      bool      `gorm:"not null;default:false" json:"is_achieved"`
	AchievedAt      *string   `gorm:"type:date" json:"achieved_at,omitempty"`
	Notes           *string   `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
