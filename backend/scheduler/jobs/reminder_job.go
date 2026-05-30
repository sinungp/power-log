package jobs

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/sinun/powerlog-backend/models"
	"gorm.io/gorm"
)

func ProcessReminders(db *gorm.DB) {
	var prefs []models.NotificationPreference
	db.Find(&prefs)

	now := time.Now()
	nowTime := now.Format("15:04:00")
	today := now.Format("2006-01-02")
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}

	for _, pref := range prefs {
		// Job 1: Reminder Recovery
		if pref.ReminderRecovery {
			recTime := pref.ReminderRecoveryTime
			if len(recTime) >= 5 {
				recTime = recTime + ":00"
			}
			if isTimeMatch(nowTime, recTime) {
				var existing models.RecoveryLog
				result := db.Where("user_id = ? AND logged_at = ?", pref.UserID, today).First(&existing)
				if result.Error != nil {
					// User hasn't logged recovery today -> send reminder
					notif := models.Notification{
						UserID:  pref.UserID,
						Type:    "reminder_recovery",
						Title:   "Waktunya catat recovery",
						Message: "Kamu belum mencatat recovery hari ini. Catat tidur dan stres harianmu untuk tracking yang lebih akurat.",
					}
					db.Create(&notif)

					// Telegram
					if pref.TelegramChatID != nil && *pref.TelegramChatID != "" {
						sendTelegram(*pref.TelegramChatID, notif.Message)
					}
				}
			}
		}

		// Job 2: Reminder Lift
		if pref.ReminderLift {
			days := parseDays(pref.ReminderLiftDays)
			if contains(days, weekday) {
				var existing models.LiftRecord
				result := db.Where("user_id = ? AND lifted_at = ?", pref.UserID, today).First(&existing)
				if result.Error != nil {
					notif := models.Notification{
						UserID:  pref.UserID,
						Type:    "reminder_lift",
						Title:   "Waktunya latihan!",
						Message: "Hari ini adalah jadwal latihanmu. Catat lift record-mu sekarang!",
					}
					db.Create(&notif)
				}
			}
		}
	}
}

func isTimeMatch(current, target string) bool {
	if len(current) < 5 || len(target) < 5 {
		return false
	}
	return current[:5] == target[:5]
}

func parseDays(daysStr string) []int {
	parts := strings.Split(daysStr, ",")
	var result []int
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		var d int
		if _, err := fmt.Sscanf(p, "%d", &d); err == nil {
			result = append(result, d)
		}
	}
	return result
}

func contains(slice []int, val int) bool {
	for _, v := range slice {
		if v == val {
			return true
		}
	}
	return false
}

type TelegramMessage struct {
	ChatID string `json:"chat_id"`
	Text   string `json:"text"`
}

func sendTelegram(chatID, message string) {
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		return
	}

	body := TelegramMessage{
		ChatID: chatID,
		Text:   message,
	}
	jsonBody, _ := json.Marshal(body)

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)
	_, err := http.Post(url, "application/json", bytes.NewReader(jsonBody))
	if err != nil {
		log.Printf("Telegram send error: %v", err)
	}
}
