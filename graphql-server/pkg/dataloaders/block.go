package dataloaders

import (
	godataloader "github.com/cychiuae/go-dataloader"
	"github.com/oursky/likedao/pkg/models"
	"github.com/oursky/likedao/pkg/queries"
)

type BlockDataloader interface {
	LoadBlockByHash(blockHash string) (*models.Block, error)
	LoadBlockByHashes(blockHashes []string) ([]*models.Block, []error)
	LoadBlockByHeight(height int64) (*models.Block, error)
}
type BlockByHashDataloader interface {
	Load(id string) (*models.Block, error)
	LoadAll(ids []string) ([]*models.Block, []error)
}

type BlockByHeightDataloader interface {
	Load(height int64) (*models.Block, error)
}

type IBlockDataloader struct {
	blockByHashLoader   BlockByHashDataloader
	blockByHeightLoader BlockByHeightDataloader
}

func NewBlockDataloader(blockQuery queries.IBlockQuery) BlockDataloader {
	blockByHashLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[string, *models.Block]{
		Fetch: func(blockHashes []string) ([]*models.Block, []error) {
			blocks, err := blockQuery.QueryBlocksByHashes(blockHashes)
			if err != nil {
				errors := make([]error, 0, len(blockHashes))
				for range blockHashes {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return blocks, nil
		},
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
	})

	blockByHeightLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[int64, *models.Block]{
		Fetch: func(heights []int64) ([]*models.Block, []error) {
			blocks, err := blockQuery.QueryBlocksByHeights(heights)
			if err != nil {
				errors := make([]error, 0, len(heights))
				for range heights {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return blocks, nil
		},
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
	})

	return &IBlockDataloader{
		blockByHashLoader:   blockByHashLoader,
		blockByHeightLoader: blockByHeightLoader,
	}
}

func (d *IBlockDataloader) LoadBlockByHash(blockHash string) (*models.Block, error) {
	return d.blockByHashLoader.Load(blockHash)
}

func (d *IBlockDataloader) LoadBlockByHashes(blockHashes []string) ([]*models.Block, []error) {
	return d.blockByHashLoader.LoadAll(blockHashes)
}

func (d *IBlockDataloader) LoadBlockByHeight(height int64) (*models.Block, error) {
	return d.blockByHeightLoader.Load(height)
}
