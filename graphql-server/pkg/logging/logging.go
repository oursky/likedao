package logging

import (
	"context"
	"time"

	"github.com/evalphobia/logrus_sentry"
	"github.com/oursky/likedao/pkg/config"
	"github.com/sirupsen/logrus"
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

	if logConfig.Sentry != nil {
		hook, err := logrus_sentry.NewSentryHook(logConfig.Sentry.DSN, []logrus.Level{
			logrus.PanicLevel,
			logrus.FatalLevel,
			logrus.ErrorLevel,
		})

		if err != nil {
			logrus.WithError(err).Warnf("failed to initialize sentry hook")
			return
		}

		if logConfig.Sentry.Environment != "" {
			hook.SetEnvironment(logConfig.Sentry.Environment)
		}

		hook.Timeout = time.Duration(1) * time.Second
		hook.StacktraceConfiguration.Enable = true

		logrus.AddHook(hook)
	}
}
