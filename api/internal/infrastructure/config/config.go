package config

import (
	"os"
)

type Config struct {
	Port              string
	DSN               string
	HackathonDSN      string
	EvolutionBaseURL  string
	EvolutionInstance string
	EvolutionAPIKey   string
	AnthropicAPIKey   string
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		dsn = "host=localhost user=hackuser password=h4ckPass@549sSijfl_sD dbname=hackathondb port=5436 sslmode=disable TimeZone=UTC"
	}
	hackathonDSN := os.Getenv("HACKATHON_DSN")
	if hackathonDSN == "" {
		hackathonDSN = "host=3.208.123.187 user=hackathon_dev password=PasswordHackaton2026 dbname=biofooddb port=5432 sslmode=disable TimeZone=UTC"
	}
	return Config{
		Port:              port,
		DSN:               dsn,
		HackathonDSN:      hackathonDSN,
		EvolutionBaseURL:  os.Getenv("EVOLUTION_BASE_URL"),
		EvolutionInstance: os.Getenv("EVOLUTION_INSTANCE"),
		EvolutionAPIKey:   os.Getenv("EVOLUTION_API_KEY"),
		AnthropicAPIKey:   os.Getenv("ANTHROPIC_API_KEY"),
	}
}
