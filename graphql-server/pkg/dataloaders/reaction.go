package dataloaders

import (
	godataloader "github.com/cychiuae/go-dataloader"
	"github.com/oursky/likedao/pkg/queries"
)

type ReactionDataloader interface {
	LoadProposalReactionCount(id int) (queries.ReactionCounts, error)
}

type ProposalReactionCountDataloader interface {
	Load(id int) (queries.ReactionCounts, error)
	LoadAll(ids []int) ([]queries.ReactionCounts, []error)
}

type IReactionDataloader struct {
	proposalReactionCountLoader ProposalReactionCountDataloader
}

func NewReactionDataloader(reactionQuery queries.IReactionQuery) ReactionDataloader {
	proposalReactionCountLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[int, queries.ReactionCounts]{
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
		Fetch: func(ids []int) ([]queries.ReactionCounts, []error) {
			reactionCounts, err := reactionQuery.ScopeProposals(ids).QueryTargetReactions()
			if err != nil {
				errors := make([]error, 0, len(ids))
				for range ids {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return reactionCounts, nil
		},
	})

	return &IReactionDataloader{
		proposalReactionCountLoader: proposalReactionCountLoader,
	}
}

func (d *IReactionDataloader) LoadProposalReactionCount(id int) (queries.ReactionCounts, error) {
	return d.proposalReactionCountLoader.Load(id)
}
