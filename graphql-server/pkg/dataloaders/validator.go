package dataloaders

import (
	godataloader "github.com/cychiuae/go-dataloader"
	"github.com/oursky/likedao/pkg/models"
	"github.com/oursky/likedao/pkg/queries"
)

type ValidatorDataloader interface {
	LoadValidatorWithInfoByConsensusAddress(address string) (*models.Validator, error)
	LoadValidatorWithInfoBySelfDelegationAddress(address string) (*models.Validator, error)
	LoadRelativeTotalProposalCountByConsensusAddress(address string) (*int, error)
}
type ValidatorLoader interface {
	Load(address string) (*models.Validator, error)
}

type ProposalCountLoader interface {
	Load(address string) (*int, error)
}

type IValidatorDataloader struct {
	validatorConsensusAddressLoader                  ValidatorLoader
	validatorSelfDelegationAddressLoader             ValidatorLoader
	relativeTotalProposalCountConsensusAddressLoader ProposalCountLoader
}

func NewValidatorDataloader(validatorQuery queries.IValidatorQuery) ValidatorDataloader {
	validatorConsensusAddressLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[string, *models.Validator]{
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
		Fetch: func(addresses []string) ([]*models.Validator, []error) {
			validators, err := validatorQuery.QueryValidatorsByConsensusAddresses(addresses)
			if err != nil {
				errors := make([]error, 0, len(addresses))
				for range addresses {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return validators, nil
		},
	})

	validatorSelfDelegationAddressLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[string, *models.Validator]{
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
		Fetch: func(addresses []string) ([]*models.Validator, []error) {
			validators, err := validatorQuery.QueryValidatorsBySelfDelegationAddresses(addresses)
			if err != nil {
				errors := make([]error, 0, len(addresses))
				for range addresses {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return validators, nil
		},
	})

	relativeTotalProposalCountConsensusAddressLoader := godataloader.NewDataLoader(godataloader.DataLoaderConfig[string, *int]{
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
		Fetch: func(addresses []string) ([]*int, []error) {
			counts, err := validatorQuery.QueryRelativeTotalProposalCounts(addresses)
			if err != nil {
				errors := make([]error, 0, len(addresses))
				for range addresses {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return counts, nil
		},
	})

	return &IValidatorDataloader{
		validatorConsensusAddressLoader:                  validatorConsensusAddressLoader,
		validatorSelfDelegationAddressLoader:             validatorSelfDelegationAddressLoader,
		relativeTotalProposalCountConsensusAddressLoader: relativeTotalProposalCountConsensusAddressLoader,
	}
}

func (d *IValidatorDataloader) LoadValidatorWithInfoByConsensusAddress(address string) (*models.Validator, error) {
	return d.validatorConsensusAddressLoader.Load(address)
}

func (d *IValidatorDataloader) LoadValidatorWithInfoBySelfDelegationAddress(address string) (*models.Validator, error) {
	return d.validatorSelfDelegationAddressLoader.Load(address)
}

func (d *IValidatorDataloader) LoadRelativeTotalProposalCountByConsensusAddress(address string) (*int, error) {
	return d.relativeTotalProposalCountConsensusAddressLoader.Load(address)
}
