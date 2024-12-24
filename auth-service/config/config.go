package config

import (
	"auth-service/internal/database"
	"auth-service/models"
	"log"

	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var Config ConfigStruct

type ConfigStruct struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
}

func LoadConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("/app/config")
	viper.AddConfigPath("config")
	viper.AddConfigPath(".")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file: %v", err)
	}
	viper.Unmarshal(&Config)

	dsn := "host=" + Config.DBHost + " user=" + Config.DBUser + " password=" + Config.DBPassword + " dbname=" + Config.DBName + " port=" + Config.DBPort + " sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	database.SetDB(db)
	database.GetDB().AutoMigrate(&models.User{})
}
