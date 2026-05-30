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
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
