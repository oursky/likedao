package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/uptrace/bun"
)

type IChainQuery interface {
	QueryAvergeBlockTime() (*models.AverageBlockTime, error)
}

type ChainQuery struct {
	ctx     context.Context
	session *bun.DB
}

type QueryBlockTimeResult struct {
	BlockTime    float64 `bun:"previous_block_time_diff"`
	IndexerDelay float64 `bun:"latest_block_time_diff"`
}

func NewChainQuery(ctx context.Context, session *bun.DB) IChainQuery {
	return &ChainQuery{ctx: ctx, session: session}
}

func (q *ChainQuery) QueryAvergeBlockTime() (*models.AverageBlockTime, error) {
	averageTime := new(models.AverageBlockTime)
	err := q.session.NewSelect().Model(averageTime).Limit(1).Scan(q.ctx)
	if err != nil {
		return nil, err
	}

	return averageTime, nil
}
