package errors

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

type ServerErrorCode string

const (
	InternalError     ServerErrorCode = "INTERNAL_SERVER_ERROR"
	ValidationFailure ServerErrorCode = "VALIDATION_FAILURE"
	NotFound          ServerErrorCode = "NOT_FOUND"
	Unknown           ServerErrorCode = "UNKNOWN"
	QueryError        ServerErrorCode = "QUERY_ERROR"
	MutationError     ServerErrorCode = "MUTATION_ERROR"
	Unauthenticated   ServerErrorCode = "UNAUTHENTICATED"
	BadUserInput      ServerErrorCode = "BAD_USER_INPUT"
)

var defaultErrorMessage = map[ServerErrorCode]string{
	InternalError:     "Internal server error",
	ValidationFailure: "Failed to validate values",
	NotFound:          "Not found",
	Unauthenticated:   "Unauthenticated",
	Unknown:           "Unknown error",
	QueryError:        "Query error",
	MutationError:     "Mutation error",
	BadUserInput:      "User input error",
}

func (c ServerErrorCode) NewErrorWithDefaultMessage(ctx context.Context) *gqlerror.Error {
	return c.NewError(ctx, defaultErrorMessage[c])
}

func (c ServerErrorCode) NewError(ctx context.Context, msg string) *gqlerror.Error {
	return &gqlerror.Error{
		Path:    graphql.GetPath(ctx),
		Message: msg,
		Extensions: map[string]interface{}{
			"code": string(c),
		},
	}
}
