package scheduler

import (
	"log"
	"os"
	"time"

	"github.com/sinun/powerlog-backend/scheduler/jobs"
	"gorm.io/gorm"
)

func Start(db *gorm.DB) {
	if os.Getenv("SCHEDULER_ENABLED") != "true" {
		log.Println("Scheduler disabled")
		return
	}

	log.Println("Scheduler started")

	// Every 60 minutes - reminder jobs
	go func() {
		ticker := time.NewTicker(60 * time.Minute)
		defer ticker.Stop()

		// Run once at startup
		jobs.ProcessReminders(db)

		for range ticker.C {
			jobs.ProcessReminders(db)
		}
	}()

	// Daily at 00:05 - goal check
	go func() {
		for {
			now := time.Now()
			next := time.Date(now.Year(), now.Month(), now.Day(), 0, 5, 0, 0, now.Location())
			if next.Before(now) {
				next = next.Add(24 * time.Hour)
			}
			time.Sleep(time.Until(next))
			jobs.CheckGoals(db)
		}
	}()

	// Daily at 03:00 - cleanup
	go func() {
		for {
			now := time.Now()
			next := time.Date(now.Year(), now.Month(), now.Day(), 3, 0, 0, 0, now.Location())
			if next.Before(now) {
				next = next.Add(24 * time.Hour)
			}
			time.Sleep(time.Until(next))
			jobs.Cleanup(db)
		}
	}()

	select {}
}
