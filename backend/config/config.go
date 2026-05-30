package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort        string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPass         string
	DBName         string
	JWTSecret      string
	JWTExpireHours string

	AppURL string
	FrontendURL string

	OpenRouterAPIKey   string
	OpenRouterBaseURL  string
	OpenRouterModel    string
	OpenRouterFallback string
	TelegramBotToken   string
	SchedulerEnabled   string
}

func Load() *Config {
	godotenv.Load()

	return &Config{
		AppPort:        getEnv("APP_PORT", "8080"),
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "3306"),
		DBUser:         getEnv("DB_USER", "powerlog_user"),
		DBPass:         getEnv("DB_PASS", "powerlog_pass"),
		DBName:         getEnv("DB_NAME", "powerlog_db"),
		JWTSecret:      getEnv("JWT_SECRET", "ganti_dengan_random_string_panjang"),
		JWTExpireHours: getEnv("JWT_EXPIRE_HOURS", "72"),

		AppURL:      getEnv("APP_URL", "http://localhost:8080"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost"),

		OpenRouterAPIKey:   getEnv("OPENROUTER_API_KEY", ""),
		OpenRouterBaseURL:  getEnv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
		OpenRouterModel:    getEnv("OPENROUTER_MODEL_PRIMARY", "meta-llama/llama-3.1-8b-instruct:free"),
		OpenRouterFallback: getEnv("OPENROUTER_MODEL_FALLBACK", "google/gemma-2-9b-it:free"),
		TelegramBotToken:   getEnv("TELEGRAM_BOT_TOKEN", ""),
		SchedulerEnabled:   getEnv("SCHEDULER_ENABLED", "false"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
