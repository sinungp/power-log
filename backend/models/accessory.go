package models

type Accessory struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	TargetLift  string `gorm:"type:enum('squat','bench','deadlift','general');not null" json:"target_lift"`
	Name        string `gorm:"type:varchar(150);not null" json:"name"`
	Description string `gorm:"type:text" json:"description,omitempty"`
	SetsReps    string `gorm:"type:varchar(50)" json:"sets_reps,omitempty"`
	Difficulty  string `gorm:"type:enum('beginner','intermediate','advanced');default:'beginner'" json:"difficulty"`
}
