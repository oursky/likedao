package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/uptrace/bun"
)

type ICommunityPoolQuery interface {
	QueryCommunityPool() (*models.CommunityPool, error)
}

type CommunityPoolQuery struct {
	ctx     context.Context
	session *bun.DB
}

func NewCommunityPoolQuery(ctx context.Context, session *bun.DB) ICommunityPoolQuery {
	return &CommunityPoolQuery{ctx: ctx, session: session}
}

func (q *CommunityPoolQuery) QueryCommunityPool() (*models.CommunityPool, error) {
	communityPool := new(models.CommunityPool)
	err := q.session.NewSelect().Model(communityPool).Limit(1).Scan(q.ctx)
	if err != nil {
		return nil, err
	}

	return communityPool, nil
}
