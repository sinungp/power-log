package jobs

import (
	"log"
	"time"

	"github.com/sinun/powerlog-backend/models"
	"gorm.io/gorm"
)

func Cleanup(db *gorm.DB) {
	log.Println("Running cleanup job...")

	// Hapus recommendations yang sudah expired
	db.Where("expires_at < ?", time.Now()).Delete(&models.Recommendation{})

	// Hapus notifications yang lebih dari 90 hari
	cutoff := time.Now().AddDate(0, 0, -90)
	db.Where("sent_at < ?", cutoff).Delete(&models.Notification{})

	log.Println("Cleanup completed")
}
