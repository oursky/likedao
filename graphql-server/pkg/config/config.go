package config

import (
	"os"
	"strconv"
	"strings"
)

type LogConfig struct {
	Level  string
	Sentry *SentryConfig
}

type DatabaseConfig struct {
	URL      string
	Schema   string
	PoolSize int
	Verbose  bool
}

type SentryConfig struct {
	DSN          string
	Environment  string
	IgnoreErrors []string
}

type CorsConfig struct {
	AllowOrigins []string
}

type Config struct {
	ChainDatabase  DatabaseConfig
	ServerDatabase DatabaseConfig
	Cors           CorsConfig
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
		Sentry: func() *SentryConfig {
			if sentryDsn := os.Getenv("GRAPHQL_SENTRY_DSN"); sentryDsn != "" {
				sentryEnv := os.Getenv("GRAPHQL_SENTRY_ENVIRONMENT")
				if sentryEnv == "" {
					sentryEnv = "graphql-server"
				}
				return &SentryConfig{
					DSN:         sentryDsn,
					Environment: sentryEnv,
				}
			}
			return nil
		}(),
	}

	corsConfig := CorsConfig{
		AllowOrigins: func() []string {
			allowOrigins := os.Getenv("CORS_ALLOW_ORIGINS")
			if allowOrigins == "" {
				return []string{}
			}
			return strings.Split(allowOrigins, ",")
		}(),
	}

	return Config{
		ServerDatabase: serverDatabaseConfig,
		ChainDatabase:  chainDatabaseConfig,
		Cors:           corsConfig,
		Log:            logConfig,
	}
}
