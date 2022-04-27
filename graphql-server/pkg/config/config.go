package config

import (
	"os"
	"strconv"
)

type LogConfig struct {
	Level string
}

type DatabaseConfig struct {
	URL      string
	Schema   string
	PoolSize int
	Verbose  bool
}

type Config struct {
	Database DatabaseConfig
	Log      LogConfig
}

func LoadConfigFromEnv() Config {
	databasePoolSizeStr := os.Getenv("DATABASE_POOL_SIZE")
	if databasePoolSizeStr == "" {
		databasePoolSizeStr = "5"
	}
	databasePoolSize, err := strconv.Atoi(databasePoolSizeStr)
	if err != nil {
		databasePoolSize = 5
	}
	databaseConfig := DatabaseConfig{
		URL:      os.Getenv("DATABASE_URL"),
		Schema:   os.Getenv("DATABASE_SCHEMA"),
		PoolSize: databasePoolSize,
		Verbose:  os.Getenv("DATABASE_VERBOSE") == "1",
	}

	logConfig := LogConfig{
		Level: func() string {
			level := os.Getenv("LOG_LEVEL")
			if level == "" {
				level = "warn"
			}
			return level
		}(),
	}

	return Config{
		Database: databaseConfig,
		Log:      logConfig,
	}
}
