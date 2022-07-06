package dataloaders

import (
	godataloader "github.com/cychiuae/go-dataloader"
	"github.com/oursky/likedao/pkg/models"
	"github.com/oursky/likedao/pkg/queries"
)

type ProposalDataloader interface {
	Load(id string) (*models.Proposal, error)
	LoadAll(ids []string) ([]*models.Proposal, []error)
	LoadProposalTallyResult(id int) (*models.ProposalTallyResult, error)
	LoadProposalTurnout(id int) (*float64, error)
}

type ProposalLoader interface {
	Load(id string) (*models.Proposal, error)
	LoadAll(ids []string) ([]*models.Proposal, []error)
}

type ProposalTallyResultDataloader interface {
	Load(id int) (*models.ProposalTallyResult, error)
	LoadAll(ids []int) ([]*models.ProposalTallyResult, []error)
}

type ProposalTurnoutDataloader interface {
	Load(id int) (*float64, error)
	LoadAll(ids []int) ([]*float64, []error)
}

type IProposalDataloader struct {
	proposalLoader            ProposalLoader
	proposalTallyResultLoader ProposalTallyResultDataloader
	proposalTurnoutDataloader ProposalTurnoutDataloader
}

func NewProposalDataloader(proposalQuery queries.IProposalQuery) ProposalDataloader {
	proposalLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[string, *models.Proposal]{
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
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
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
	})

	proposalTurnoutDataloader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[int, *float64]{
		Fetch: func(ids []int) ([]*float64, []error) {
			turnouts, err := proposalQuery.QueryTurnoutByProposalIDs(ids)
			if err != nil {
				errors := make([]error, 0, len(ids))
				for range ids {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return turnouts, nil
		},
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
	})

	return &IProposalDataloader{
		proposalLoader:            proposalLoader,
		proposalTallyResultLoader: proposalTallyResultLoader,
		proposalTurnoutDataloader: proposalTurnoutDataloader,
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

func (d IProposalDataloader) LoadProposalTurnout(id int) (*float64, error) {
	return d.proposalTurnoutDataloader.Load(id)
}
