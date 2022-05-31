package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/uptrace/bun"
)

type IStakingPoolQuery interface {
	QueryStakingPool() (*models.StakingPool, error)
}

type StakingPoolQuery struct {
	ctx     context.Context
	session *bun.DB
}

func NewStakingPoolQuery(ctx context.Context, session *bun.DB) IStakingPoolQuery {
	return &StakingPoolQuery{ctx: ctx, session: session}
}

func (q *StakingPoolQuery) QueryStakingPool() (*models.StakingPool, error) {
	stakingPool := new(models.StakingPool)
	err := q.session.NewSelect().Model(stakingPool).Limit(1).Scan(q.ctx)
	if err != nil {
		return nil, err
	}

	return stakingPool, nil
}
