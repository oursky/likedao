package dataloaders

import (
	"time"

	godataloader "github.com/cychiuae/go-dataloader"
	"github.com/oursky/likedao/pkg/models"
	"github.com/oursky/likedao/pkg/queries"
)

type BlockDataloader interface {
	Load(id string) (*models.Block, error)
	LoadAll(ids []string) ([]*models.Block, []error)
}

func NewBlockDataloader(blockQuery queries.IBlockQuery) BlockDataloader {
	return godataloader.NewDataLoader(godataloader.DataLoaderConfig[string, *models.Block]{
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
		MaxBatch: 1000,
		Wait:     20 * time.Millisecond,
	})
}
