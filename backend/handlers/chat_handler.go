package handlers

import (
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/utils"
)

var (
	publicChatMu  sync.Mutex
	publicChatMap = map[string]int{}
)

func PublicChat(c *fiber.Ctx) error {
	ip := c.IP()

	publicChatMu.Lock()
	count := publicChatMap[ip]
	publicChatMap[ip] = count + 1
	if count >= 5 {
		publicChatMu.Unlock()
		return utils.ErrorResponse(c, 429, "Batas chat publik: 5 pesan. Silakan daftar untuk chat tak terbatas.")
	}
	publicChatMu.Unlock()

	go func() {
		time.Sleep(1 * time.Hour)
		publicChatMu.Lock()
		publicChatMap[ip]--
		if publicChatMap[ip] <= 0 {
			delete(publicChatMap, ip)
		}
		publicChatMu.Unlock()
	}()

	var input struct {
		Message string `json:"message" validate:"required,min=1,max=500"`
	}
	if err := c.BodyParser(&input); err != nil || input.Message == "" {
		return utils.ErrorResponse(c, 400, "Message is required")
	}
	if len(input.Message) > 500 {
		return utils.ErrorResponse(c, 400, "Message too long (max 500 chars)")
	}

	systemPrompt := `Kamu adalah asisten virtual PowerLog, aplikasi powerlifting all-in-one. 
Berikan penjelasan yang rapi, terstruktur, dan mudah dibaca dalam Bahasa Indonesia.
Gunakan format berikut:
- Gunakan bullet points (-) untuk daftar fitur.
- Gunakan cetak tebal (**) untuk poin penting.
- Berikan spasi antar paragraf.

Fitur utama: 1RM Calculator, Lift Tracking (SBD), Exercise Library, Warmup & Cooldown Checklist, 
Body Weight Tracking, Recovery Logging (sleep/stress/DOMS), Analytics & Charts, 
Goal Setting (SBD/competition/body weight), AI Recommendations (rule-based + AI analysis),
Notifications & Reminders (Telegram), Customizable Dashboard Widgets, Onboarding Wizard, OAuth2 Login.
Jawab singkat (max 180 kata) dan ajak mereka mencoba aplikasi.`

	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" {
		return utils.SuccessResponse(c, 200, "Chat response", fiber.Map{
			"reply": "PowerLog adalah aplikasi powerlifting all-in-one dengan fitur tracking SBD, 1RM calculator, goal setting, AI recommendations, dan banyak lagi! Silakan daftar gratis untuk mencoba semua fitur.",
		})
	}

	reply, err := utils.CallOpenRouter(apiKey, systemPrompt, input.Message)
	if err != nil {
		fmt.Printf("Chat error: %v\n", err)
		return utils.ErrorResponse(c, 502, "AI chat sedang tidak tersedia, coba lagi nanti")
	}

	return utils.SuccessResponse(c, 200, "Chat response", fiber.Map{
		"reply": reply,
	})
}

func DashboardChat(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var input struct {
		Message string `json:"message" validate:"required,min=1,max=1000"`
	}
	if err := c.BodyParser(&input); err != nil || input.Message == "" {
		return utils.ErrorResponse(c, 400, "Message is required")
	}
	if len(input.Message) > 1000 {
		return utils.ErrorResponse(c, 400, "Message too long (max 1000 chars)")
	}

	profileStr := buildChatProfile(userID)

	systemPrompt := fmt.Sprintf(`Kamu adalah coach powerlifting AI yang terintegrasi di aplikasi PowerLog.
Gunakan data atlet berikut untuk memberikan saran program latihan yang spesifik dalam Bahasa Indonesia:

%s

Beri saran program latihan yang detail (set, reps, RPE, notes) berdasarkan data di atas dan permintaan user.
Jawab maksimal 200 kata. Fokus pada rekomendasi actionable, bukan motivasi umum.`, profileStr)

	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" {
		return utils.ErrorResponse(c, 502, "AI chat membutuhkan OPENROUTER_API_KEY")
	}

	reply, err := utils.CallOpenRouter(apiKey, systemPrompt, input.Message)
	if err != nil {
		fmt.Printf("Chat error: %v\n", err)
		fmt.Printf("Dashboard chat error: %v\n", err)
		return utils.ErrorResponse(c, 502, "AI chat sedang tidak tersedia, coba lagi nanti")
	}

	return utils.SuccessResponse(c, 200, "Chat response", fiber.Map{
		"reply": reply,
		"user_id": userID,
	})
}

func buildChatProfile(userID uint) string {
	type Est1RM struct {
		LiftType string
		Est1RMKg float64
	}
	var lifts []Est1RM
	database.DB.Raw(`SELECT lift_type, MAX(weight_kg * (1 + reps / 30.0)) AS est_1rm_kg
		FROM lift_records WHERE user_id = ? AND deleted_at IS NULL GROUP BY lift_type`, userID).Scan(&lifts)

	type VolRow struct{ TotalKg float64 }
	var vol VolRow
	database.DB.Raw(`SELECT COALESCE(SUM(weight_kg * reps), 0) AS total_kg
		FROM lift_records WHERE user_id = ? AND deleted_at IS NULL AND lifted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`, userID).Scan(&vol)

	type RecRow struct{ AvgSleep, AvgSleepQ, AvgStress float64 }
	var rec RecRow
	database.DB.Raw(`SELECT COALESCE(AVG(sleep_hours),0) AS avg_sleep, COALESCE(AVG(sleep_quality),0) AS avg_sleep_q, COALESCE(AVG(stress_level),0) AS avg_stress
		FROM recovery_logs WHERE user_id = ? AND logged_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`, userID).Scan(&rec)

	var goalCount int64
	database.DB.Table("user_goals").Where("user_id = ? AND is_achieved = false", userID).Count(&goalCount)

	var parts []string
	for _, l := range lifts {
		parts = append(parts, fmt.Sprintf("- %s: %.1fkg", l.LiftType, l.Est1RMKg))
	}
	liftStr := strings.Join(parts, "\n")
	if liftStr == "" {
		liftStr = "- Belum ada data lift"
	}

	return fmt.Sprintf(`Estimasi 1RM:
%s

Volume 7 hari terakhir: %.0f kg total
Rata-rata tidur: %.1f jam, kualitas: %.1f/10, stres: %.1f/10
Goal aktif: %d`,
		liftStr, vol.TotalKg, rec.AvgSleep, rec.AvgSleepQ, rec.AvgStress, goalCount)
}
