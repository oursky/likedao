package errors

import (
	"context"
	"fmt"
	"os"

	"github.com/99designs/gqlgen/graphql"
	goerrors "github.com/pkg/errors"
	"github.com/vektah/gqlparser/v2/gqlerror"

	"github.com/oursky/likedao/pkg/logging"
)

type stackTracer interface {
	StackTrace() goerrors.StackTrace
}

func DefaultErrorPresenter(ctx context.Context, e error) *gqlerror.Error {
	if e == nil {
		return nil
	}

	// The error `e` here is a gqlerror wrapping the original error.
	var err *gqlerror.Error
	if !goerrors.As(e, &err) {
		return nil
	}

	// You can call err.Unwrap() here to get the original error.
	innerErr := err.Unwrap()

	// If there is no `code` in the Extensions field, we treat this as an
	// internal error.
	if _, ok := err.Extensions["code"]; !ok {
		operationCtx := graphql.GetOperationContext(ctx)
		logging.GetLogger(ctx).
			WithField("query", operationCtx.RawQuery).
			WithField("variables", operationCtx.Variables).
			WithField("operationName", operationCtx.Operation.Name).
			WithField("path", graphql.GetPath(ctx)).
			WithError(innerErr).
			Errorf("Unhandled internal error: %s", innerErr)

		if stackErr, ok := innerErr.(stackTracer); ok {
			fmt.Fprintf(os.Stderr, "%+v", stackErr.StackTrace())
		}

		return InternalError.NewErrorWithDefaultMessage(ctx)
	}

	// Otherwise the error is returned to user as-is.
	return err
}
