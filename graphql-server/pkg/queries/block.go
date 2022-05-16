package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/uptrace/bun"
)

type IBlockQuery interface {
	QueryLatestBlock() (*models.Block, error)
}

type BlockQuery struct {
	ctx     context.Context
	session *bun.DB
}

func NewBlockQuery(ctx context.Context, session *bun.DB) IBlockQuery {
	return &BlockQuery{ctx: ctx, session: session}
}

func (q *BlockQuery) QueryLatestBlock() (*models.Block, error) {
	block := new(models.Block)
	err := q.session.NewSelect().Model(block).Order("timestamp DESC").Limit(1).Scan(q.ctx)
	if err != nil {
		return nil, err
	}

	return block, nil
}
