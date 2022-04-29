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
	ChainDatabase  DatabaseConfig
	ServerDatabase DatabaseConfig
	Log            LogConfig
}

func LoadConfigFromEnv() Config {
	serverDatabasePoolSizeStr := os.Getenv("SERVER_DATABASE_POOL_SIZE")
	if serverDatabasePoolSizeStr == "" {
		serverDatabasePoolSizeStr = "5"
	}
	serverDatabasePoolSize, err := strconv.Atoi(serverDatabasePoolSizeStr)
	if err != nil {
		serverDatabasePoolSize = 5
	}
	serverDatabaseConfig := DatabaseConfig{
		URL:      os.Getenv("SERVER_DATABASE_URL"),
		Schema:   os.Getenv("SERVER_DATABASE_SCHEMA"),
		PoolSize: serverDatabasePoolSize,
		Verbose:  os.Getenv("SERVER_DATABASE_VERBOSE") == "1",
	}

	chainDatabasePoolSizeStr := os.Getenv("BDJUNO_DATABASE_POOL_SIZE")
	if chainDatabasePoolSizeStr == "" {
		chainDatabasePoolSizeStr = "5"
	}
	chainDatabasePoolSize, err := strconv.Atoi(chainDatabasePoolSizeStr)
	if err != nil {
		chainDatabasePoolSize = 5
	}
	chainDatabaseConfig := DatabaseConfig{
		URL:      os.Getenv("BDJUNO_DATABASE_URL"),
		Schema:   os.Getenv("BDJUNO_DATABASE_SCHEMA"),
		PoolSize: chainDatabasePoolSize,
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
		ServerDatabase: serverDatabaseConfig,
		ChainDatabase:  chainDatabaseConfig,
		Log:            logConfig,
	}
}
