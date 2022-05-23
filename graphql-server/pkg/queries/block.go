package queries

import (
	"context"
	"strings"

	"github.com/oursky/likedao/pkg/models"
	"github.com/uptrace/bun"
)

type IBlockQuery interface {
	QueryLatestBlock() (*models.Block, error)
	QueryBlockByHash(hash string) (*models.Block, error)
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

func (q *BlockQuery) QueryBlockByHash(hash string) (*models.Block, error) {
	block := new(models.Block)
	err := q.session.NewSelect().Model(block).Where("hash = ?", strings.ToUpper(hash)).Scan(q.ctx)
	if err != nil {
		return nil, err
	}

	return block, nil
}
