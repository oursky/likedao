package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	pkgContext "github.com/oursky/likedao/pkg/context"
	"github.com/oursky/likedao/pkg/models"
)

func (r *queryResolver) ChainHealth(ctx context.Context) (*models.ChainHealth, error) {
	currentBlock, err := pkgContext.GetQueriesFromCtx(ctx).Block.QueryLatestBlock()
	if err != nil {
		return nil, err
	}
	blockTimes, err := pkgContext.GetQueriesFromCtx(ctx).Chain.QueryBlockTime()
	if err != nil {
		return nil, err
	}

	averageBlockTime, err := pkgContext.GetQueriesFromCtx(ctx).Chain.QueryAvergeBlockTime()
	if err != nil {
		return nil, err
	}
	fmt.Printf("%+v\n", blockTimes.IndexerDelay)

	var status models.ChainStatus
	// If indexer misses blocks for 1 minute, it is considered as halted.
	if blockTimes.IndexerDelay > 60 {
		status = models.ChainStatusOffline
		// If previous block time difference is larger than 3 average block time, it is considered as congested.
	} else if blockTimes.BlockTime > 3*averageBlockTime.AverageTime {
		status = models.ChainStatusCongested
	} else {
		status = models.ChainStatusOnline
	}

	return &models.ChainHealth{
		Status: status,
		Height: currentBlock.Height,
	}, nil
}
