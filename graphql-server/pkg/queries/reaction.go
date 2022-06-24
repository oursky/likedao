package queries

import (
	"context"
	"strconv"

	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type IUserReactionQuery interface {
	QueryUserReactions() ([]*models.Reaction, error)
}

type ITargetReactionQuery interface {
	ScopeUserAddress(address string) IUserReactionQuery
	QueryTargetReactions() ([][]models.DBReactionCount, error)
}

type IReactionQuery interface {
	ScopeProposals(proposalIDs []int) ITargetReactionQuery
}

type TargetReactionQuery struct {
	ReactionQuery

	scopedTargetType string
	scopedTargetIds  []string
}

type UserReactionQuery struct {
	TargetReactionQuery

	scopedUserAddress string
}

type ReactionQuery struct {
	ctx     context.Context
	session *bun.DB
}

func NewReactionQuery(ctx context.Context, session *bun.DB) IReactionQuery {
	return &ReactionQuery{ctx: ctx, session: session}
}

func (q *ReactionQuery) ScopeProposals(proposalIds []int) ITargetReactionQuery {
	var targetIds []string
	for _, id := range proposalIds {
		targetIds = append(targetIds, strconv.Itoa(id))
	}

	return &TargetReactionQuery{
		ReactionQuery:    *q,
		scopedTargetType: string(models.ReactionTargetTypeProposal),
		scopedTargetIds:  targetIds,
	}
}

func (q *TargetReactionQuery) ScopeUserAddress(address string) IUserReactionQuery {
	return &UserReactionQuery{TargetReactionQuery: *q, scopedUserAddress: address}
}

func (q *TargetReactionQuery) NewQuery() *bun.SelectQuery {
	query := q.session.NewSelect().Model((*models.Reaction)(nil))

	if len(q.scopedTargetIds) > 0 && q.scopedTargetType != "" {
		query = query.Where("target_type = (?) AND target_id in (?)", q.scopedTargetType, bun.In(q.scopedTargetIds))
	}

	return query
}

func (q *TargetReactionQuery) QueryTargetReactions() ([][]models.DBReactionCount, error) {
	type TargetReactions struct {
		TargetID  string
		Reactions []models.DBReactionCount
	}

	query := q.NewQuery()

	// Count the occurrences of the reactions in a target and sort by their creation date in the form of json
	// For example:
	// {
	// 	":like:": 2,
	// 	":dislike": 3
	// }
	res := make([]TargetReactions, 0)
	reactionCountQuery := query.
		ColumnExpr("target_id, reaction, count(target_id) as count, min(created_at) as earliestDate").
		Group("reaction", "target_id").
		OrderExpr("earliestDate ASC")

	err := q.session.NewSelect().
		ColumnExpr("c.target_id, json_agg(json_build_object('reaction', c.reaction, 'count', c.count))::jsonb as reactions").
		TableExpr("(?) as c", reactionCountQuery).
		Group("c.target_id").
		Scan(q.ctx, &res)

	if err != nil {
		return nil, errors.WithStack(err)
	}

	result := make([][]models.DBReactionCount, 0, len(res))
	targetIDToReactions := make(map[string][]models.DBReactionCount, len(res))
	for _, reactionMap := range res {
		targetIDToReactions[reactionMap.TargetID] = reactionMap.Reactions
	}

	for _, id := range q.scopedTargetIds {
		reactionMap, exists := targetIDToReactions[id]
		if exists {
			result = append(result, reactionMap)
		} else {
			result = append(result, []models.DBReactionCount{})
		}
	}

	return result, nil
}

func (q *UserReactionQuery) NewQuery() *bun.SelectQuery {
	return q.session.NewSelect().
		Model((*models.Reaction)(nil)).
		Where("address = (?)", q.scopedUserAddress)
}

func (q *UserReactionQuery) QueryUserReactions() ([]*models.Reaction, error) {
	query := q.NewQuery()

	var reactions []models.Reaction
	if err := query.Scan(q.ctx, &reactions); err != nil {
		return nil, errors.WithStack(err)
	}

	result := make([]*models.Reaction, 0, len(q.scopedTargetIds))
	targetIDToReactions := make(map[string]models.Reaction, len(reactions))
	for _, reaction := range reactions {
		targetIDToReactions[reaction.TargetID] = reaction
	}

	for _, id := range q.scopedTargetIds {
		reaction, exists := targetIDToReactions[id]
		if exists {
			result = append(result, &reaction)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil
}
