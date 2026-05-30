package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/handlers"
	"github.com/sinun/powerlog-backend/middleware"
)

func Setup(app *fiber.App) {
	// Initialize OAuth providers
	handlers.InitOAuth()

	api := app.Group("/api/v1")

	// Auth (public)
	auth := api.Group("/auth")
	auth.Post("/register", handlers.Register)
	auth.Post("/login", handlers.Login)
	auth.Get("/me", middleware.Protected(), handlers.Me)

	// Calculator (public)
	api.Post("/calculator/one-rm", handlers.CalculateOneRM)

	// Chat (public + protected)
	api.Post("/chat/public", handlers.PublicChat)
	api.Post("/chat", middleware.Protected(), handlers.DashboardChat)

	// Lifts (protected)
	lifts := api.Group("/lifts", middleware.Protected())
	lifts.Get("/", handlers.GetLifts)
	lifts.Post("/", handlers.CreateLift)
	lifts.Get("/summary", handlers.GetLiftSummary)
	lifts.Get("/:id", handlers.GetLift)
	lifts.Put("/:id", handlers.UpdateLift)
	lifts.Delete("/:id", handlers.DeleteLift)

	// Accessories (public)
	api.Get("/accessories", handlers.GetAccessories)

	// Checklists (public)
	api.Get("/checklists", handlers.GetChecklists)

	// Checklist logs (protected)
	checklistLogs := api.Group("/checklists/log", middleware.Protected())
	checklistLogs.Post("/", handlers.CreateChecklistLog)
	checklistLogs.Get("/", handlers.GetChecklistLogs)

	// OAuth routes (outside /api/v1, web redirect flow)
	app.Get("/oauth/:provider/login", handlers.OAuthLogin)
	app.Get("/oauth/:provider/callback", handlers.OAuthCallback)

	// Body weight (protected)
	bw := api.Group("/body-weight", middleware.Protected())
	bw.Get("/", handlers.GetBodyWeights)
	bw.Post("/", handlers.CreateBodyWeight)
	bw.Get("/latest", handlers.GetLatestBodyWeight)
	bw.Put("/:id", handlers.UpdateBodyWeight)
	bw.Delete("/:id", handlers.DeleteBodyWeight)

	// Recovery logs (protected)
	rec := api.Group("/recovery", middleware.Protected())
	rec.Get("/", handlers.GetRecoveryLogs)
	rec.Post("/", handlers.CreateRecoveryLog)
	rec.Get("/summary", handlers.GetRecoverySummary)
	rec.Put("/:id", handlers.UpdateRecoveryLog)
	rec.Delete("/:id", handlers.DeleteRecoveryLog)

	// Analytics (protected)
	analytics := api.Group("/analytics", middleware.Protected())
	analytics.Get("/volume-weekly", handlers.GetVolumeWeekly)
	analytics.Get("/intensity-distribution", handlers.GetIntensityDistribution)
	analytics.Get("/lift-ratio", handlers.GetLiftRatio)

	// Wilks calculator (public)
	api.Post("/calculator/wilks", handlers.CalculateWilksScore)

	// Onboarding (protected)
	onboarding := api.Group("/onboarding", middleware.Protected())
	onboarding.Get("/status", handlers.GetOnboardingStatus)
	onboarding.Post("/profile", handlers.SaveOnboardingProfile)
	onboarding.Post("/training-preference", handlers.SaveOnboardingTrainingPreference)
	onboarding.Post("/complete", handlers.CompleteOnboarding)

	// Goals (protected)
	goals := api.Group("/goals", middleware.Protected())
	goals.Get("/", handlers.GetGoals)
	goals.Post("/", handlers.CreateGoal)
	goals.Put("/:id", handlers.UpdateGoal)
	goals.Delete("/:id", handlers.DeleteGoal)
	goals.Get("/progress", handlers.GetGoalProgress)
	goals.Post("/:id/achieve", handlers.AchieveGoal)

	// Recommendations (protected)
	recs := api.Group("/recommendations", middleware.Protected())
	recs.Get("/", handlers.GetRecommendations)
	recs.Post("/generate", handlers.GenerateRecommendations)
	recs.Post("/ai-analysis", handlers.RequestAIAnalysis)
	recs.Put("/:id/read", handlers.MarkRecommendationRead)

	// Notifications (protected)
	notif := api.Group("/notifications", middleware.Protected())
	notif.Get("/", handlers.GetNotifications)
	notif.Put("/:id/read", handlers.MarkNotificationRead)
	notif.Put("/read-all", handlers.MarkAllNotificationsRead)
	notif.Get("/preferences", handlers.GetNotificationPreferences)
	notif.Put("/preferences", handlers.UpdateNotificationPreferences)

	// Dashboard config (protected)
	dash := api.Group("/dashboard", middleware.Protected())
	dash.Get("/config", handlers.GetDashboardConfig)
	dash.Put("/config", handlers.UpdateDashboardConfig)
}
