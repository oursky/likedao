package errors

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/oursky/likedao/pkg/logging"
)

func DefaultSentryErrorTracker(ctx context.Context, err interface{}) (userMessage error) {
	if e, ok := err.(error); ok {
		logging.GetLogger(ctx).
			WithField("path", graphql.GetPath(ctx)).
			WithError(e).
			Errorf("Unhandled internal error: %s", e)
	}

	return graphql.DefaultRecover(ctx, err)
}
