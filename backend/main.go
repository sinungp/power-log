package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/sinun/powerlog-backend/config"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/routes"
	"github.com/sinun/powerlog-backend/scheduler"
)

func main() {
	cfg := config.Load()

	if err := database.Init(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	database.Seed(database.DB)

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	routes.Setup(app)

	go scheduler.Start(database.DB)

	log.Fatal(app.Listen(":" + cfg.AppPort))
}
