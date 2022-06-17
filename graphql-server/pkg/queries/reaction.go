package queries

import (
	"context"
	"strconv"

	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type ReactionCounts = map[string]int

type ITargetReactionQuery interface {
	QueryTargetReactions() ([]ReactionCounts, error)
}

type IReactionQuery interface {
	ScopeProposals(proposalIDs []int) ITargetReactionQuery
}

type TargetReactionQuery struct {
	ReactionQuery

	scopedTargetType string
	scopedTargetIds  []string
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

func (q *TargetReactionQuery) NewQuery() *bun.SelectQuery {
	query := q.session.NewSelect().Model((*models.Reaction)(nil))

	if len(q.scopedTargetIds) > 0 && q.scopedTargetType != "" {
		query = query.Where("target_type = (?) AND target_id in (?)", q.scopedTargetType, bun.In(q.scopedTargetIds))
	}

	return query
}

func (q *TargetReactionQuery) QueryTargetReactions() ([]ReactionCounts, error) {
	type TargetReactions struct {
		TargetID  string
		Reactions ReactionCounts
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
		ColumnExpr("c.target_id, json_object_agg(c.reaction, c.count)::jsonb as reactions").
		TableExpr("(?) as c", reactionCountQuery).
		Group("c.target_id").
		Scan(q.ctx, &res)

	if err != nil {
		return nil, errors.WithStack(err)
	}

	result := make([]ReactionCounts, 0, len(res))
	targetIDToReactions := make(map[string]ReactionCounts, len(res))
	for _, reactionMap := range res {
		targetIDToReactions[reactionMap.TargetID] = reactionMap.Reactions
	}

	for _, id := range q.scopedTargetIds {
		reactionMap, exists := targetIDToReactions[id]
		if exists {
			result = append(result, reactionMap)
		} else {
			result = append(result, ReactionCounts{})
		}
	}

	return result, nil
}
