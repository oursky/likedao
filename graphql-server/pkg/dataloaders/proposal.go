package dataloaders

import (
	"time"

	godataloader "github.com/cychiuae/go-dataloader"
	"github.com/oursky/likedao/pkg/models"
	"github.com/oursky/likedao/pkg/queries"
)

type ProposalDataloader interface {
	LoadProposalTallyResult(id int) (*models.ProposalTallyResult, error)
}

type ProposalTallyResultDataloader interface {
	Load(id int) (*models.ProposalTallyResult, error)
	LoadAll(ids []int) ([]*models.ProposalTallyResult, []error)
}

type IProposalDataloader struct {
	proposalTallyResultLoader			   ProposalTallyResultDataloader
}

func NewProposalDataloader(proposalQuery queries.IProposalQuery) ProposalDataloader {
	proposalTallyResultLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[int, *models.ProposalTallyResult]{
		Fetch: func(ids []int) ([]*models.ProposalTallyResult, []error) {
			tallyResults, err := proposalQuery.QueryProposalTallyResults(ids)
			if err != nil {
				errors := make([]error, 0, len(ids))
				for range ids {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return tallyResults, nil
		},
		MaxBatch: 1000,
		Wait:     20 * time.Millisecond,
	})

	return IProposalDataloader{
		proposalTallyResultLoader: 				proposalTallyResultLoader,
	}
}

func (d IProposalDataloader) LoadProposalTallyResult(id int) (*models.ProposalTallyResult, error) {
	return d.proposalTallyResultLoader.Load(id)
}