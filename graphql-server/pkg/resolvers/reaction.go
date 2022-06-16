package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	pkgContext "github.com/oursky/likedao/pkg/context"
	servererrors "github.com/oursky/likedao/pkg/errors"
	graphql1 "github.com/oursky/likedao/pkg/generated/graphql"
	"github.com/oursky/likedao/pkg/logging"
	"github.com/oursky/likedao/pkg/models"
)

func (r *mutationResolver) SetReaction(ctx context.Context, input models.SetReactionInput) (*models.Reaction, error) {
	userAddress := pkgContext.GetAuthedUserAddress(ctx)
	var targetType models.ReactionTargetType
	err := targetType.UnmarshalGQL(input.TargetID.EntityType)
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to unmarshal target type: %v", err))
	}

	res, err := pkgContext.GetMutatorsFromCtx(ctx).Reaction.SetReaction(input.TargetID.ID, targetType, userAddress, input.Reaction)
	if err != nil {
		return nil, servererrors.MutationError.NewError(ctx, fmt.Sprintf("failed to set reaction: %v", err))
	}
	return res, nil
}

func (r *mutationResolver) UnsetReaction(ctx context.Context, input models.UnsetReactionInput) (*models.Reaction, error) {
	logger := logging.GetLogger(ctx)
	userAddress := pkgContext.GetAuthedUserAddress(ctx)
	var targetType models.ReactionTargetType
	err := targetType.UnmarshalGQL(input.TargetID.EntityType)
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to unmarshal target type: %v", err))
	}

	res, err := pkgContext.GetMutatorsFromCtx(ctx).Reaction.UnsetReaction(input.TargetID.ID, targetType, userAddress)
	if err != nil {
		logger.Error(servererrors.MutationError.NewError(ctx, fmt.Sprintf("failed to unset reaction: %v", err)))
		return nil, nil
	}

	return res, nil
}

func (r *reactionResolver) Target(ctx context.Context, obj *models.Reaction) (models.Node, error) {
	// TODO: Handle other target types
	switch obj.TargetType {
	case models.ReactionTargetTypeProposal:
		proposal, err := pkgContext.GetDataLoadersFromCtx(ctx).Proposal.Load(obj.TargetID)
		if err != nil {
			return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to load proposal: %v", err))
		}
		return proposal, nil
	default:
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("unsupported node type: %v", obj.TargetType))
	}
}

// Mutation returns graphql1.MutationResolver implementation.
func (r *Resolver) Mutation() graphql1.MutationResolver { return &mutationResolver{r} }

// Reaction returns graphql1.ReactionResolver implementation.
func (r *Resolver) Reaction() graphql1.ReactionResolver { return &reactionResolver{r} }

type mutationResolver struct{ *Resolver }
type reactionResolver struct{ *Resolver }
