package config

import (
	"os"
)

type Config struct {
	Port string
	DSN  string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		dsn = "biofood.db"
	}
	return Config{
		Port: port,
		DSN:  dsn,
	}
}
