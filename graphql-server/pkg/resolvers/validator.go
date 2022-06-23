package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	pkgContext "github.com/oursky/likedao/pkg/context"
	graphql1 "github.com/oursky/likedao/pkg/generated/graphql"
	"github.com/oursky/likedao/pkg/models"
)

func (r *validatorResolver) OperatorAddress(ctx context.Context, obj *models.Validator) (*string, error) {
	// Using dataloader here as we cannot assume the incoming validator has the info and description loaded
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return nil, err
	}

	if validator.Info == nil {
		return nil, nil
	}

	return &validator.Info.OperatorAddress, nil
}

func (r *validatorResolver) SelfDelegationAddress(ctx context.Context, obj *models.Validator) (*string, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return nil, err
	}

	if validator.Info == nil {
		return nil, nil
	}

	if validator.Info.SelfDelegateAddress == "" {
		return nil, nil
	}

	return &validator.Info.SelfDelegateAddress, nil
}

func (r *validatorResolver) Moniker(ctx context.Context, obj *models.Validator) (*string, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return nil, err
	}

	if validator.Description == nil {
		return nil, nil
	}

	if validator.Description.Moniker == "" {
		return nil, nil
	}

	return &validator.Description.Moniker, nil
}

func (r *validatorResolver) Identity(ctx context.Context, obj *models.Validator) (*string, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return nil, err
	}

	if validator.Description == nil {
		return nil, nil
	}

	if validator.Description.Identity == "" {
		return nil, nil
	}

	return &validator.Description.Identity, nil
}

func (r *validatorResolver) AvatarURL(ctx context.Context, obj *models.Validator) (*string, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return nil, err
	}

	if validator.Description == nil {
		return nil, nil
	}

	if validator.Description.AvatarURL == "" {
		return nil, nil
	}

	return &validator.Description.AvatarURL, nil
}

func (r *validatorResolver) Website(ctx context.Context, obj *models.Validator) (*string, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return nil, err
	}

	if validator.Description == nil {
		return nil, nil
	}

	if validator.Description.Website == "" {
		return nil, nil
	}

	return &validator.Description.Website, nil
}

func (r *validatorResolver) SecurityContact(ctx context.Context, obj *models.Validator) (*string, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return nil, err
	}

	if validator.Description == nil {
		return nil, nil
	}

	if validator.Description.SecurityContact == "" {
		return nil, nil
	}

	return &validator.Description.SecurityContact, nil
}

func (r *validatorResolver) Details(ctx context.Context, obj *models.Validator) (*string, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return nil, err
	}

	if validator.Description == nil {
		return nil, nil
	}

	if validator.Description.Details == "" {
		return nil, nil
	}

	return &validator.Description.Details, nil
}

// Validator returns graphql1.ValidatorResolver implementation.
func (r *Resolver) Validator() graphql1.ValidatorResolver { return &validatorResolver{r} }

type validatorResolver struct{ *Resolver }
