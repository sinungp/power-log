package handlers

import (
	"math"
	"strconv"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
)

type WilksInput struct {
	BodyWeightKg float64 `json:"body_weight_kg" validate:"required,gt=0"`
	TotalKg      float64 `json:"total_kg" validate:"required,gt=0"`
	Sex          string  `json:"sex" validate:"required,oneof=male female"`
}

type LiftRatioResult struct {
	Squat1RM            float64 `json:"squat_1rm"`
	Bench1RM            float64 `json:"bench_1rm"`
	Deadlift1RM         float64 `json:"deadlift_1rm"`
	BenchToSquatPct     float64 `json:"bench_to_squat_pct"`
	DeadliftToSquatPct  float64 `json:"deadlift_to_squat_pct"`
	SquatToBodyweight   float64 `json:"squat_to_bodyweight"`
	BenchToBodyweight   float64 `json:"bench_to_bodyweight"`
	DeadliftToBodyweight float64 `json:"deadlift_to_bodyweight"`
	Weakness            string  `json:"weakness"`
	WeaknessNote        string  `json:"weakness_note"`
}

func GetVolumeWeekly(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	weeks, _ := strconv.Atoi(c.Query("weeks", "4"))
	if weeks > 12 {
		weeks = 12
	}
	if weeks < 1 {
		weeks = 4
	}

	startDate := time.Now().AddDate(0, 0, -(weeks*7)+1).Format("2006-01-02")

	type VolumeRow struct {
		WeekStart string  `json:"week_start"`
		WeekEnd   string  `json:"week_end"`
		LiftType  string  `json:"lift_type"`
		VolumeKg  float64 `json:"volume_kg"`
	}

	var rows []VolumeRow
	database.DB.Raw(`
		SELECT
			DATE_SUB(lifted_at, INTERVAL WEEKDAY(lifted_at) DAY) AS week_start,
			DATE_ADD(DATE_SUB(lifted_at, INTERVAL WEEKDAY(lifted_at) DAY), INTERVAL 6 DAY) AS week_end,
			lift_type,
			SUM(weight_kg * reps) AS volume_kg
		FROM lift_records
		WHERE user_id = ? AND lifted_at >= ? AND deleted_at IS NULL
		GROUP BY week_start, lift_type
		ORDER BY week_start ASC, lift_type ASC
	`, userID, startDate).Scan(&rows)

	// Aggregate by week
	type WeekVolume struct {
		WeekStart      string  `json:"week_start"`
		WeekEnd        string  `json:"week_end"`
		SquatVolumeKg  float64 `json:"squat_volume_kg"`
		BenchVolumeKg  float64 `json:"bench_volume_kg"`
		DeadliftVolumeKg float64 `json:"deadlift_volume_kg"`
		TotalVolumeKg  float64 `json:"total_volume_kg"`
		AvgIntensityPct float64 `json:"avg_intensity_pct"`
	}

	weekMap := make(map[string]*WeekVolume)
	weekOrder := []string{}

	for _, r := range rows {
		if _, ok := weekMap[r.WeekStart]; !ok {
			weekMap[r.WeekStart] = &WeekVolume{
				WeekStart: r.WeekStart,
				WeekEnd:   r.WeekEnd,
			}
			weekOrder = append(weekOrder, r.WeekStart)
		}
		w := weekMap[r.WeekStart]
		switch r.LiftType {
		case "squat":
			w.SquatVolumeKg = r.VolumeKg
		case "bench":
			w.BenchVolumeKg = r.VolumeKg
		case "deadlift":
			w.DeadliftVolumeKg = r.VolumeKg
		}
		w.TotalVolumeKg += r.VolumeKg
	}

	// Calculate avg intensity per week (needs estimated 1RM)
	type Est1RM struct {
		LiftType string  `json:"lift_type"`
		Est1RM   float64 `json:"est_1rm"`
	}
	var est1RMs []Est1RM
	database.DB.Raw(`
		SELECT lift_type, MAX(weight_kg * (1 + reps / 30.0)) AS est_1rm
		FROM lift_records
		WHERE user_id = ? AND deleted_at IS NULL AND lifted_at >= ?
		GROUP BY lift_type
	`, userID, startDate).Scan(&est1RMs)

	est1RMMap := map[string]float64{}
	for _, e := range est1RMs {
		est1RMMap[e.LiftType] = e.Est1RM
	}

	// Calculate intensity per week
	type IntensityRow struct {
		WeekStart  string  `json:"week_start"`
		IntensityPct float64 `json:"intensity_pct"`
	}
	var intensityRows []IntensityRow
	database.DB.Raw(`
		SELECT
			DATE_SUB(lifted_at, INTERVAL WEEKDAY(lifted_at) DAY) AS week_start,
			weight_kg / (SELECT MAX(l2.weight_kg * (1 + l2.reps / 30.0))
						 FROM lift_records l2
						 WHERE l2.user_id = ? AND l2.lift_type = lift_records.lift_type AND l2.deleted_at IS NULL AND l2.lifted_at >= ?
						) * 100 AS intensity_pct
		FROM lift_records
		WHERE user_id = ? AND lifted_at >= ? AND deleted_at IS NULL
		HAVING intensity_pct IS NOT NULL
	`, userID, startDate, userID, startDate).Scan(&intensityRows)

	intensityMap := map[string][]float64{}
	for _, ir := range intensityRows {
		intensityMap[ir.WeekStart] = append(intensityMap[ir.WeekStart], ir.IntensityPct)
	}

	result := []WeekVolume{}
	for _, ws := range weekOrder {
		w := weekMap[ws]
		if intensities, ok := intensityMap[ws]; ok && len(intensities) > 0 {
			var sum float64
			for _, v := range intensities {
				sum += v
			}
			w.AvgIntensityPct = math.Round(sum/float64(len(intensities))*100) / 100
		}
		result = append(result, *w)
	}

	return utils.SuccessResponse(c, 200, "Volume weekly data", result)
}

func GetIntensityDistribution(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	liftType := c.Query("lift", "")
	weeks, _ := strconv.Atoi(c.Query("weeks", "4"))
	if weeks > 12 {
		weeks = 12
	}
	if weeks < 1 {
		weeks = 4
	}

	startDate := time.Now().AddDate(0, 0, -(weeks*7)+1).Format("2006-01-02")

	type LiftIntensity struct {
		LiftType     string  `json:"lift_type"`
		WeightKg     float64 `json:"weight_kg"`
		Est1RM       float64 `json:"est_1rm"`
		IntensityPct float64 `json:"intensity_pct"`
	}

	query := `
		SELECT lr.lift_type, lr.weight_kg,
			(SELECT MAX(l2.weight_kg * (1 + l2.reps / 30.0))
			 FROM lift_records l2
			 WHERE l2.user_id = ? AND l2.lift_type = lr.lift_type AND l2.deleted_at IS NULL AND l2.lifted_at >= ?
			) AS est_1rm
		FROM lift_records lr
		WHERE lr.user_id = ? AND lr.lifted_at >= ? AND lr.deleted_at IS NULL
	`
	args := []interface{}{userID, startDate, userID, startDate}

	if liftType != "" {
		query += " AND lr.lift_type = ?"
		args = append(args, liftType)
	}

	var rows []LiftIntensity
	database.DB.Raw(query, args...).Scan(&rows)

	z1, z2, z3, z4 := 0, 0, 0, 0
	total := 0
	for _, r := range rows {
		if r.Est1RM <= 0 {
			continue
		}
		pct := r.WeightKg / r.Est1RM * 100
		total++
		switch {
		case pct < 70:
			z1++
		case pct < 80:
			z2++
		case pct < 90:
			z3++
		default:
			z4++
		}
	}

	toPct := func(n int) float64 {
		if total == 0 {
			return 0
		}
		return math.Round(float64(n)/float64(total)*10000) / 100
	}

	return utils.SuccessResponse(c, 200, "Intensity distribution", fiber.Map{
		"zone_1_recovery":    toPct(z1),
		"zone_2_hypertrophy": toPct(z2),
		"zone_3_strength":    toPct(z3),
		"zone_4_peaking":     toPct(z4),
		"total_sessions":     total,
	})
}

func GetLiftRatio(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	// Get estimated 1RMs
	type Est1RM struct {
		LiftType string
		Est1RMKg float64
	}
	var est1RMs []Est1RM
	database.DB.Raw(`
		SELECT lift_type, MAX(weight_kg * (1 + reps / 30.0)) AS est_1rm_kg
		FROM lift_records
		WHERE user_id = ? AND deleted_at IS NULL
		GROUP BY lift_type
	`, userID).Scan(&est1RMs)

	estMap := map[string]float64{}
	for _, e := range est1RMs {
		estMap[e.LiftType] = math.Round(e.Est1RMKg*100) / 100
	}

	squat := estMap["squat"]
	bench := estMap["bench"]
	deadlift := estMap["deadlift"]

	// Get latest body weight
	var bw models.BodyWeightLog
	database.DB.Where("user_id = ?", userID).Order("logged_at DESC").First(&bw)

	bwKg := bw.WeightKg
	if bwKg == 0 {
		bwKg = 75 // default fallback
	}

	result := LiftRatioResult{
		Squat1RM:   squat,
		Bench1RM:   bench,
		Deadlift1RM: deadlift,
	}

	if squat > 0 {
		result.BenchToSquatPct = math.Round(bench/squat*10000) / 100
		result.DeadliftToSquatPct = math.Round(deadlift/squat*10000) / 100
	}

	if bwKg > 0 {
		result.SquatToBodyweight = math.Round(squat/bwKg*100) / 100
		result.BenchToBodyweight = math.Round(bench/bwKg*100) / 100
		result.DeadliftToBodyweight = math.Round(deadlift/bwKg*100) / 100
	}

	// Weakness detection
	btos := result.BenchToSquatPct
	dtos := result.DeadliftToSquatPct

	switch {
	case btos > 0 && btos < 65:
		result.Weakness = "bench"
		result.WeaknessNote = "Bench press kamu relatif lemah dibanding squat. Fokuskan accessory ke pushing."
	case dtos > 0 && dtos < 110:
		result.Weakness = "deadlift"
		result.WeaknessNote = "Deadlift kamu relatif lemah dibanding squat. Tambah volume posterior chain."
	case btos > 85:
		result.Weakness = "squat"
		result.WeaknessNote = "Squat kamu relatif lemah dibanding bench. Perkuat quad dan core."
	default:
		result.Weakness = "balanced"
		result.WeaknessNote = "Rasio antar lift sudah seimbang. Pertahankan progres."
	}

	return utils.SuccessResponse(c, 200, "Lift ratios", result)
}

func CalculateWilksScore(c *fiber.Ctx) error {
	var input WilksInput
	if err := c.BodyParser(&input); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body")
	}

	v := validator.New()
	if err := v.Struct(input); err != nil {
		return utils.ErrorResponse(c, 422, err.Error())
	}

	result := utils.CalculateWilks(utils.WilksInput{
		BodyWeightKg: input.BodyWeightKg,
		TotalKg:      input.TotalKg,
		Sex:          input.Sex,
	})

	return utils.SuccessResponse(c, 200, "Wilks & IPF GL scores", result)
}
