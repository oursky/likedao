package mutators

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type IReactionMutator interface {
	SetReaction(targetID string, targetType models.ReactionTargetType, address string, reaction string) (*models.Reaction, error)
	UnsetReaction(targetID string, targetType models.ReactionTargetType, address string) (*models.Reaction, error)
}

type ReactionMutator struct {
	ctx     context.Context
	session *bun.DB
}

func NewReactionMutator(ctx context.Context, session *bun.DB) IReactionMutator {
	return &ReactionMutator{ctx: ctx, session: session}
}

func (q *ReactionMutator) UnsetReaction(targetID string, targetType models.ReactionTargetType, address string) (*models.Reaction, error) {
	reactionModel := new(models.Reaction)

	err := q.session.RunInTx(q.ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		err := q.session.NewSelect().
			Model(reactionModel).
			Where("target_id = ? AND target_type = ? AND address = ?", targetID, targetType, address).
			Scan(q.ctx)

		if err != nil {
			return err
		}

		_, err = tx.NewDelete().
			Model((*models.Reaction)(nil)).
			Where("id = ?", reactionModel.ID).
			Exec(q.ctx)

		return err
	})

	if err != nil {
		return nil, errors.WithStack(err)
	}

	return reactionModel, nil
}

func (q *ReactionMutator) SetReaction(targetID string, targetType models.ReactionTargetType, address string, reaction string) (*models.Reaction, error) {
	reactionModel := &models.Reaction{
		TargetID:   targetID,
		TargetType: targetType,
		Reaction:   reaction,
		Address:    address,
	}

	err := q.session.RunInTx(q.ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		_, err := q.session.NewInsert().
			Model(reactionModel).
			On("CONFLICT (address, target_id, target_type) DO UPDATE").
			Set("reaction = EXCLUDED.reaction").
			Returning("*").
			Exec(q.ctx)

		return err
	})

	if err != nil {
		return nil, errors.WithStack(err)
	}

	return reactionModel, nil

}
