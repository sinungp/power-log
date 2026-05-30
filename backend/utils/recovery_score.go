package utils

import "math"

type RecoveryScoreInput struct {
	SleepHours   float64
	SleepQuality uint
	StressLevel  uint
	DomsLevel    *uint
}

func CalculateRecoveryScore(input RecoveryScoreInput) float64 {
	score := (input.SleepHours/9)*30 + (float64(input.SleepQuality)/10)*30 + ((10 - float64(input.StressLevel)) / 10 * 25)

	if input.DomsLevel != nil {
		score += ((5 - float64(*input.DomsLevel)) / 4) * 15
	}

	if score > 100 {
		score = 100
	}
	if score < 0 {
		score = 0
	}

	return math.Round(score*10) / 10
}

type RecoveryTrend string

const (
	TrendImproving RecoveryTrend = "improving"
	TrendDeclining RecoveryTrend = "declining"
	TrendStable    RecoveryTrend = "stable"
)

func DetermineRecoveryTrend(recentAvg, previousAvg float64) RecoveryTrend {
	diff := recentAvg - previousAvg
	if diff > 5 {
		return TrendImproving
	}
	if diff < -5 {
		return TrendDeclining
	}
	return TrendStable
}
