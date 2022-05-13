package errors

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

type ErrorCode string

const (
	InternalError ErrorCode = "INTERNAL_ERROR"
)

var defaultErrorMessage = map[ErrorCode]string{
	InternalError: "Internal server error",
}

func (c ErrorCode) NewErrorWithDefaultMessage(ctx context.Context) *gqlerror.Error {
	return c.NewError(ctx, defaultErrorMessage[c])
}

func (c ErrorCode) NewError(ctx context.Context, msg string) *gqlerror.Error {
	return &gqlerror.Error{
		Path:    graphql.GetPath(ctx),
		Message: msg,
		Extensions: map[string]interface{}{
			"code": string(c),
		},
	}
}
