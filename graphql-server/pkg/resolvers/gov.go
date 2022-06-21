package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	pkgContext "github.com/oursky/likedao/pkg/context"
	"github.com/oursky/likedao/pkg/models"
)

func (r *queryResolver) GetGovParams(ctx context.Context) (*models.GovParams, error) {
	govParams, err := pkgContext.GetQueriesFromCtx(ctx).Gov.QueryGovParams()
	if err != nil {
		return nil, err
	}
	return govParams, nil
}
