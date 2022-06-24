package dataloaders

import (
	godataloader "github.com/cychiuae/go-dataloader"
	"github.com/oursky/likedao/pkg/models"
	"github.com/oursky/likedao/pkg/queries"
	"golang.org/x/exp/slices"
)

type ProposalDataloader interface {
	Load(id string) (*models.Proposal, error)
	LoadAll(ids []string) ([]*models.Proposal, []error)
	LoadProposalTallyResult(id int) (*models.ProposalTallyResult, error)
	LoadProposalVote(key ProposalVoteKey) (*models.ProposalVote, error)
	LoadProposalDeposit(key ProposalDepositKey) (*models.ProposalDeposit, error)
}

type ProposalLoader interface {
	Load(id string) (*models.Proposal, error)
	LoadAll(ids []string) ([]*models.Proposal, []error)
}

type ProposalTallyResultDataloader interface {
	Load(id int) (*models.ProposalTallyResult, error)
	LoadAll(ids []int) ([]*models.ProposalTallyResult, []error)
}

type ProposalVoteKey struct {
	ProposalID int
	Address    string
}
type ProposalVoteDataloader interface {
	Load(key ProposalVoteKey) (*models.ProposalVote, error)
	LoadAll(keys []ProposalVoteKey) ([]*models.ProposalVote, []error)
}

type ProposalDepositKey = ProposalVoteKey
type ProposalDepositDataloader interface {
	Load(key ProposalDepositKey) (*models.ProposalDeposit, error)
	LoadAll(keys []ProposalDepositKey) ([]*models.ProposalDeposit, []error)
}

type IProposalDataloader struct {
	proposalLoader            ProposalLoader
	proposalTallyResultLoader ProposalTallyResultDataloader
	proposalVoteLoader        ProposalVoteDataloader
	proposalDepositLoader     ProposalDepositDataloader
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

	proposalVoteLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[ProposalVoteKey, *models.ProposalVote]{
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
		Fetch: func(keys []ProposalVoteKey) ([]*models.ProposalVote, []error) {
			proposalIDs := []int{}
			addresses := []string{}
			for _, key := range keys {
				if !slices.Contains(proposalIDs, key.ProposalID) {
					proposalIDs = append(proposalIDs, key.ProposalID)
				}
				if !slices.Contains(addresses, key.Address) {
					addresses = append(addresses, key.Address)
				}
			}

			votes, err := proposalQuery.QueryProposalVotes(proposalIDs, addresses)
			if err != nil {
				errors := make([]error, 0, len(keys))
				for range keys {
					errors = append(errors, err)
				}
				return nil, errors
			}

			voteKeyToVote := make(map[ProposalVoteKey]*models.ProposalVote, len(votes))
			for _, vote := range votes {
				key := ProposalVoteKey{vote.ProposalID, vote.VoterAddress}
				voteKeyToVote[key] = vote
			}

			// map query results to input keys' order
			res := make([]*models.ProposalVote, len(keys))
			for index, key := range keys {
				res[index] = voteKeyToVote[key]
			}
			return res, nil
		},
	})

	proposalDepositLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[ProposalDepositKey, *models.ProposalDeposit]{
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
		Fetch: func(keys []ProposalDepositKey) ([]*models.ProposalDeposit, []error) {
			proposalIDs := []int{}
			addresses := []string{}
			for _, key := range keys {
				if !slices.Contains(proposalIDs, key.ProposalID) {
					proposalIDs = append(proposalIDs, key.ProposalID)
				}
				if !slices.Contains(addresses, key.Address) {
					addresses = append(addresses, key.Address)
				}
			}

			deposits, err := proposalQuery.QueryProposalDeposits(proposalIDs, addresses)
			if err != nil {
				errors := make([]error, 0, len(keys))
				for range keys {
					errors = append(errors, err)
				}
				return nil, errors
			}

			depositKeyToDeposit := make(map[ProposalDepositKey]*models.ProposalDeposit, len(deposits))
			for _, deposit := range deposits {
				key := ProposalDepositKey{deposit.ProposalID, deposit.DepositorAddress}
				depositKeyToDeposit[key] = deposit
			}

			// map query results to input keys' order
			res := make([]*models.ProposalDeposit, len(keys))
			for index, key := range keys {
				res[index] = depositKeyToDeposit[key]
			}
			return res, nil
		},
	})

	return &IProposalDataloader{
		proposalLoader:            proposalLoader,
		proposalTallyResultLoader: proposalTallyResultLoader,
		proposalVoteLoader:        proposalVoteLoader,
		proposalDepositLoader:     proposalDepositLoader,
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

func (d IProposalDataloader) LoadProposalVote(key ProposalVoteKey) (*models.ProposalVote, error) {
	return d.proposalVoteLoader.Load(key)
}

func (d IProposalDataloader) LoadProposalDeposit(key ProposalDepositKey) (*models.ProposalDeposit, error) {
	return d.proposalDepositLoader.Load(key)
}
