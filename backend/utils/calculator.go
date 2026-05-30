package utils

import "math"

type OneRMResults struct {
	Epley   float64 `json:"epley"`
	Brzycki float64 `json:"brzycki"`
	Lombardi float64 `json:"lombardi"`
	Warning string  `json:"warning,omitempty"`
}

func CalculateOneRM(weight float64, reps int) OneRMResults {
	if reps == 1 {
		return OneRMResults{
			Epley:   round2(weight),
			Brzycki: round2(weight),
			Lombardi: round2(weight),
		}
	}

	var warning string
	if reps > 10 {
		warning = "Estimasi kurang akurat untuk reps > 10"
	}

	r := float64(reps)
	return OneRMResults{
		Epley:    round2(weight * (1 + r/30)),
		Brzycki:  round2(weight * (36 / (37 - r))),
		Lombardi: round2(weight * math.Pow(r, 0.10)),
		Warning:  warning,
	}
}

func round2(val float64) float64 {
	return math.Round(val*100) / 100
}
