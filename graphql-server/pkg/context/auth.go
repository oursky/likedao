package context

import (
	"context"
)

const (
	AuthedUserContextKey contextKey = "AuthedUserContextKey"
)

func NewRequestContextWithAuthedUser(
	ctx context.Context,
	address string,
) context.Context {
	ctx = context.WithValue(ctx, AuthedUserContextKey, address)
	return ctx
}

func GetAuthedUserAddress(ctx context.Context) string {
	address, ok := ctx.Value(AuthedUserContextKey).(string)
	if !ok {
		return ""
	}
	return address
}
