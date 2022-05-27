package queries

import (
	"context"
	"fmt"

	"github.com/oursky/likedao/pkg/models"
	"github.com/uptrace/bun"
)

type IChainQuery interface {
	QueryAvergeBlockTime() (*models.AverageBlockTime, error)
	QueryBlockTime() (*QueryBlockTimeResult, error)
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

func (q *ChainQuery) QueryBlockTime() (*QueryBlockTimeResult, error) {

	var res []*QueryBlockTimeResult

	err := q.session.NewSelect().Model((*models.Block)(nil)).ColumnExpr(`
		EXTRACT(EPOCH FROM (timestamp - lag(timestamp, 1) OVER (ORDER BY timestamp))) AS previous_block_time_diff,
		EXTRACT(EPOCH FROM (NOW() - timestamp)) AS latest_block_time_diff
	`).Order("timestamp DESC").Limit(1).Scan(q.ctx, &res)

	if err != nil {
		return nil, err
	}

	if len(res) == 0 {
		return nil, fmt.Errorf("no block time data")
	}

	return res[0], nil
}
