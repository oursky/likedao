package dataloaders

import (
	"time"

	godataloader "github.com/cychiuae/go-dataloader"
	"github.com/oursky/likedao/pkg/models"
	"github.com/oursky/likedao/pkg/queries"
)

type ProposalDataloader interface {
	Load(id string) (*models.Proposal, error)
	LoadAll(ids []string) ([]*models.Proposal, []error)
	LoadProposalTallyResult(id int) (*models.ProposalTallyResult, error)
}

type ProposalLoader interface {
	Load(id string) (*models.Proposal, error)
	LoadAll(ids []string) ([]*models.Proposal, []error)
}

type ProposalTallyResultDataloader interface {
	Load(id int) (*models.ProposalTallyResult, error)
	LoadAll(ids []int) ([]*models.ProposalTallyResult, []error)
}

type IProposalDataloader struct {
	proposalLoader            ProposalLoader
	proposalTallyResultLoader ProposalTallyResultDataloader
}

func NewProposalDataloader(proposalQuery queries.IProposalQuery) ProposalDataloader {
	proposalLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[string, *models.Proposal]{
		MaxBatch: 1000,
		Wait:     20 * time.Millisecond,
		Fetch: func(ids []string) ([]*models.Proposal, []error) {
			proposals, err := proposalQuery.QueryProposalByIDs(ids)
			if err != nil {
				errors := make([]error, 0, len(ids))
				for range ids {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return proposals, nil
		},
	})

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

	return &IProposalDataloader{
		proposalLoader:            proposalLoader,
		proposalTallyResultLoader: proposalTallyResultLoader,
	}
}

func (d *IProposalDataloader) Load(id string) (*models.Proposal, error) {
	return d.proposalLoader.Load(id)
}

func (d *IProposalDataloader) LoadAll(ids []string) ([]*models.Proposal, []error) {
	return d.proposalLoader.LoadAll(ids)
}

func (d IProposalDataloader) LoadProposalTallyResult(id int) (*models.ProposalTallyResult, error) {
	return d.proposalTallyResultLoader.Load(id)
}
