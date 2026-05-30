package utils

import "math"

type WilksResult struct {
	WilksScore   float64 `json:"wilks_score"`
	IPFGLScore   float64 `json:"ipf_gl_score"`
}

type WilksInput struct {
	BodyWeightKg float64 `json:"body_weight_kg"`
	TotalKg      float64 `json:"total_kg"`
	Sex          string  `json:"sex"`
}

// Wilks coefficients
var (
	wilksMale   = [6]float64{-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-06, -1.291e-08}
	wilksFemale = [6]float64{594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-05, -9.054e-08}
)

// IPF GL coefficients (raw)
var (
	ipfGLMale   = [3]float64{1236.25115, 1449.21864, 0.01644}
	ipfGLFemale = [3]float64{758.63878, 949.31382, 0.02435}
)

func wilksDenom(bw float64, coeff [6]float64) float64 {
	return coeff[0] + coeff[1]*bw + coeff[2]*math.Pow(bw, 2) + coeff[3]*math.Pow(bw, 3) + coeff[4]*math.Pow(bw, 4) + coeff[5]*math.Pow(bw, 5)
}

func CalculateWilks(input WilksInput) WilksResult {
	bw := input.BodyWeightKg
	total := input.TotalKg

	var coeff [6]float64
	if input.Sex == "male" {
		coeff = wilksMale
	} else {
		coeff = wilksFemale
	}

	denom := wilksDenom(bw, coeff)
	wilks := total * (500 / denom)

	// IPF GL
	var ipf [3]float64
	if input.Sex == "male" {
		ipf = ipfGLMale
	} else {
		ipf = ipfGLFemale
	}

	gl := total * 100 / (ipf[0] - ipf[1]*math.Exp(-ipf[2]*bw))

	return WilksResult{
		WilksScore: round2(wilks),
		IPFGLScore: round2(gl),
	}
}
