package models

import "time"

type UserProfile struct {
	ID               uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID           uint      `gorm:"not null;uniqueIndex" json:"user_id"`
	Sex              string    `gorm:"type:enum('male','female');not null" json:"sex"`
	BirthDate        *string   `gorm:"type:date" json:"birth_date,omitempty"`
	ExperienceLevel  string    `gorm:"type:enum('beginner','intermediate','advanced');not null;default:'beginner'" json:"experience_level"`
	HasCompeted      bool      `gorm:"not null;default:false" json:"has_competed"`
	TrainingDaysWeek uint      `gorm:"type:tinyint unsigned;not null;default:3" json:"training_days_week"`
	PrimaryFocus     string    `gorm:"type:enum('sbd','squat','bench','deadlift');not null;default:'sbd'" json:"primary_focus"`
	EquipmentType    string    `gorm:"type:enum('full','home','minimal');not null;default:'full'" json:"equipment_type"`
	OnboardingDone   bool      `gorm:"not null;default:false" json:"onboarding_done"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
