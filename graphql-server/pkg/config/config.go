package config

import (
	"os"
	"strconv"
	"strings"
)

type ChainConfig struct {
	Bech32Prefix string
	CoinDenom    string
}

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

type SessionConfig struct {
	CookieDomain    string
	SignatureSecret string
	NonceExpiry     int
	SessionExpiry   int
}

type Config struct {
	ChainDatabase  DatabaseConfig
	ServerDatabase DatabaseConfig
	Cors           CorsConfig
	Log            LogConfig
	Chain          ChainConfig
	Session        SessionConfig
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

	coinDenom := os.Getenv("CHAIN_COIN_DENOM")
	if coinDenom == "" {
		coinDenom = "nanolike"
	}
	bech32Prefix := os.Getenv("CHAIN_BECH32_PREFIX")
	if bech32Prefix == "" {
		bech32Prefix = "like"
	}
	chainConfig := ChainConfig{
		CoinDenom:    coinDenom,
		Bech32Prefix: bech32Prefix,
	}

	sessionExpiryStr := os.Getenv("SESSION_EXPIRY")
	if sessionExpiryStr == "" {
		sessionExpiryStr = "3600"
	}
	sessionExpiry, err := strconv.Atoi(sessionExpiryStr)
	if err != nil {
		sessionExpiry = 3600
	}

	nonceExpiryStr := os.Getenv("NONCE_EXPIRY")
	if nonceExpiryStr == "" {
		nonceExpiryStr = "86400"
	}
	nonceExpiry, err := strconv.Atoi(nonceExpiryStr)
	if err != nil {
		nonceExpiry = 86400
	}

	sessionConfig := SessionConfig{
		CookieDomain:    os.Getenv("COOKIE_DOMAIN"),
		SignatureSecret: os.Getenv("SIGNATURE_SECRET"),
		SessionExpiry:   sessionExpiry,
		NonceExpiry:     nonceExpiry,
	}

	return Config{
		ServerDatabase: serverDatabaseConfig,
		ChainDatabase:  chainDatabaseConfig,
		Cors:           corsConfig,
		Log:            logConfig,
		Chain:          chainConfig,
		Session:        sessionConfig,
	}
}
