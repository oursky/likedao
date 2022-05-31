package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/oursky/likedao/pkg/models"
)

func (r *queryResolver) Node(ctx context.Context, id models.NodeID) (models.Node, error) {
	switch id.EntityType {
	case "test":
		return r.QueryTestByID(ctx, id)
	case "block":
		return r.BlockByID(ctx, id)
	default:
		panic(fmt.Sprintf(
			`unknown entity type "%s"`,
			id.EntityType,
		))
	}
}
