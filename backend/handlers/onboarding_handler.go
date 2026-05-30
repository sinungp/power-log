package handlers

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
)

type ProfileInput struct {
	Sex             string `json:"sex" validate:"required,oneof=male female"`
	BirthDate       string `json:"birth_date" validate:"omitempty"`
	ExperienceLevel string `json:"experience_level" validate:"required,oneof=beginner intermediate advanced"`
	HasCompeted     bool   `json:"has_competed"`
}

type TrainingPreferenceInput struct {
	TrainingDaysWeek uint   `json:"training_days_week" validate:"required,min=1,max=7"`
	PrimaryFocus     string `json:"primary_focus" validate:"required,oneof=sbd squat bench deadlift"`
	EquipmentType    string `json:"equipment_type" validate:"required,oneof=full home minimal"`
}

func GetOnboardingStatus(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var profile models.UserProfile
	result := database.DB.Where("user_id = ?", userID).First(&profile)

	if result.Error != nil {
		return utils.SuccessResponse(c, 200, "Onboarding status", fiber.Map{
			"onboarding_done": false,
			"current_step":    1,
		})
	}

	step := 1
	if profile.Sex != "" {
		step = 2
	}
	if profile.TrainingDaysWeek > 0 {
		step = 3
	}
	if profile.OnboardingDone {
		step = 5
	}

	return utils.SuccessResponse(c, 200, "Onboarding status", fiber.Map{
		"onboarding_done": profile.OnboardingDone,
		"current_step":    step,
	})
}

func SaveOnboardingProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input ProfileInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	v := validator.New()
	if err := v.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	var profile models.UserProfile
	result := database.DB.Where("user_id = ?", userID).First(&profile)

	if result.Error != nil {
		profile = models.UserProfile{
			UserID:          userID,
			Sex:             input.Sex,
			ExperienceLevel: input.ExperienceLevel,
			HasCompeted:     input.HasCompeted,
		}
		if input.BirthDate != "" {
			profile.BirthDate = &input.BirthDate
		}
		database.DB.Create(&profile)
	} else {
		profile.Sex = input.Sex
		profile.ExperienceLevel = input.ExperienceLevel
		profile.HasCompeted = input.HasCompeted
		if input.BirthDate != "" {
			profile.BirthDate = &input.BirthDate
		}
		database.DB.Save(&profile)
	}

	return utils.SuccessResponse(c, 200, "Profile saved", profile)
}

func SaveOnboardingTrainingPreference(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input TrainingPreferenceInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	v := validator.New()
	if err := v.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	var profile models.UserProfile
	if result := database.DB.Where("user_id = ?", userID).First(&profile); result.Error != nil {
		return utils.ErrorResponse(c, 404, "Complete profile step first")
	}

	profile.TrainingDaysWeek = input.TrainingDaysWeek
	profile.PrimaryFocus = input.PrimaryFocus
	profile.EquipmentType = input.EquipmentType
	database.DB.Save(&profile)

	return utils.SuccessResponse(c, 200, "Training preferences saved", profile)
}

func CompleteOnboarding(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var profile models.UserProfile
	if result := database.DB.Where("user_id = ?", userID).First(&profile); result.Error != nil {
		return utils.ErrorResponse(c, 404, "Complete previous onboarding steps first")
	}

	profile.OnboardingDone = true
	database.DB.Save(&profile)

	return utils.SuccessResponse(c, 200, "Onboarding completed", fiber.Map{
		"onboarding_done": true,
	})
}
