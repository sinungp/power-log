package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/utils"
)

type CalculatorInput struct {
	WeightKg float64 `json:"weight_kg" validate:"required,gt=0"`
	Reps     int     `json:"reps" validate:"required,gt=0"`
}

func CalculateOneRM(c *fiber.Ctx) error {
	var input CalculatorInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	if input.WeightKg <= 0 {
		return utils.ErrorResponse(c, 422, "weight_kg must be greater than 0")
	}
	if input.Reps <= 0 {
		return utils.ErrorResponse(c, 422, "reps must be greater than 0")
	}

	results := utils.CalculateOneRM(input.WeightKg, input.Reps)

	return utils.SuccessResponse(c, 200, "1RM calculated", results)
}
