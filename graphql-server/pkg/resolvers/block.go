package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	pkgContext "github.com/oursky/likedao/pkg/context"
	graphql1 "github.com/oursky/likedao/pkg/generated/graphql"
	"github.com/oursky/likedao/pkg/models"
)

func (r *queryResolver) LatestBlock(ctx context.Context) (*models.Block, error) {
	res, err := pkgContext.GetQueriesFromCtx(ctx).Block.QueryLatestBlock()
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (r *queryResolver) BlockByID(ctx context.Context, id models.NodeID) (*models.Block, error) {
	res, err := pkgContext.GetQueriesFromCtx(ctx).Block.QueryBlockByHash(id.ID)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Query returns graphql1.QueryResolver implementation.
func (r *Resolver) Query() graphql1.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
