package database

import (
	"fmt"

	"github.com/sinun/powerlog-backend/config"
	"github.com/sinun/powerlog-backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init(cfg *config.Config) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPass, cfg.DBHost, cfg.DBPort, cfg.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	if err := DB.AutoMigrate(
		&models.User{},
		&models.LiftRecord{},
		&models.Accessory{},
		&models.Checklist{},
		&models.UserChecklistLog{},
	); err != nil {
		return err
	}

	DB.Exec("ALTER TABLE users MODIFY password varchar(255) NULL;")

	return nil
}
