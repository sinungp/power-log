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
}
