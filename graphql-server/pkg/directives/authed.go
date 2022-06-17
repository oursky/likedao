package directives

import (
	"context"

	"github.com/99designs/gqlgen/graphql"
	pkgContext "github.com/oursky/likedao/pkg/context"
	servererrors "github.com/oursky/likedao/pkg/errors"
)

func Authed(ctx context.Context, obj interface{}, next graphql.Resolver) (interface{}, error) {
	address := pkgContext.GetAuthedUserAddress(ctx)
	if address == "" {
		return nil, servererrors.Unauthenticated.NewErrorWithDefaultMessage(ctx)
	}

	return next(ctx)
}
