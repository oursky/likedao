package queries

import (
	"context"
	"strings"

	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type IBlockQuery interface {
	QueryLatestBlock() (*models.Block, error)
	QueryBlockByHash(hash string) (*models.Block, error)
	QueryBlocksByHashes(hashes []string) ([]*models.Block, error)
	QueryBlocksByHeights(heights []int64) ([]*models.Block, error)
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

func (q *BlockQuery) QueryBlocksByHashes(hashes []string) ([]*models.Block, error) {
	if len(hashes) == 0 {
		return []*models.Block{}, nil
	}

	blocks := make([]models.Block, 0)
	uppercasedHashes := make([]string, 0, len(hashes))
	for _, hash := range hashes {
		uppercasedHashes = append(uppercasedHashes, strings.ToUpper(hash))
	}
	if err := q.session.NewSelect().Model(&blocks).Where("hash IN (?)", bun.In(uppercasedHashes)).Scan(q.ctx); err != nil {
		return nil, errors.WithStack(err)
	}

	result := make([]*models.Block, 0, len(blocks))
	hashToBlock := make(map[string]models.Block, len(blocks))
	for _, block := range blocks {
		hashToBlock[block.Hash] = block
	}

	for _, hash := range uppercasedHashes {
		block, exists := hashToBlock[hash]
		if exists {
			result = append(result, &block)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil
}

func (q *BlockQuery) QueryBlocksByHeights(heights []int64) ([]*models.Block, error) {
	if len(heights) == 0 {
		return []*models.Block{}, nil
	}

	blocks := make([]models.Block, 0)
	if err := q.session.NewSelect().Model(&blocks).Where("height IN (?)", bun.In(heights)).Scan(q.ctx); err != nil {
		return nil, errors.WithStack(err)
	}

	result := make([]*models.Block, 0, len(heights))
	heightToBlock := make(map[int64]models.Block, len(blocks))
	for _, block := range blocks {
		heightToBlock[int64(block.Height)] = block
	}

	for _, height := range heights {
		block, exists := heightToBlock[height]
		if exists {
			result = append(result, &block)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil
}
