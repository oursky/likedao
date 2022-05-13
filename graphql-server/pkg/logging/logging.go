package logging

import (
	"context"

	"github.com/sirupsen/logrus"

	"github.com/oursky/likedao/pkg/config"
)

type Fields logrus.Fields

type contextKey string

const loggerContextKey = contextKey("loggerContextKey")

func GetLogger(ctx context.Context) *logrus.Entry {
	if logger, ok := ctx.Value(loggerContextKey).(*logrus.Entry); ok {
		return logger
	}

	return logrus.WithFields(logrus.Fields{})
}

func ContextWithFields(ctx context.Context, fields Fields) context.Context {
	logger := GetLogger(ctx)
	return context.WithValue(ctx, loggerContextKey, logger.WithFields(logrus.Fields(fields)))
}

func ContextWithLogger(ctx context.Context, logger *logrus.Entry) context.Context {
	return context.WithValue(ctx, loggerContextKey, logger)
}

func ConfigureLogger(logConfig config.LogConfig) {
	logLevel, err := logrus.ParseLevel(logConfig.Level)
	if err != nil {
		logrus.WithError(err).Warnf(`unrecognized log level "%s"`, logConfig.Level)
	} else {
		logrus.SetLevel(logLevel)
	}
}
