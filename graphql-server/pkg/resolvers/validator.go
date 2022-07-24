package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	pkgContext "github.com/oursky/likedao/pkg/context"
	servererrors "github.com/oursky/likedao/pkg/errors"
	graphql1 "github.com/oursky/likedao/pkg/generated/graphql"
	"github.com/oursky/likedao/pkg/models"
)

func (r *queryResolver) Validators(ctx context.Context, input models.QueryValidatorsInput) (*models.Connection[models.Validator], error) {
	validatorQuery := pkgContext.GetQueriesFromCtx(ctx).Validator

	res, err := validatorQuery.QueryPaginatedValidators(input.First, input.After, []string{})
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to query validators: %v", err))
	}

	validatorCursorMap := make(map[string]string)
	for _, validator := range res.Items {
		cursorString := validator.ConsensusAddress
		validatorCursorMap[validator.NodeID().String()] = cursorString
	}

	conn := models.NewConnection(res.Items, func(model models.Validator) string {
		return validatorCursorMap[model.NodeID().String()]
	})

	conn.TotalCount = res.PaginationInfo.TotalCount
	conn.PageInfo.HasNextPage = res.PaginationInfo.HasNext
	conn.PageInfo.HasPreviousPage = res.PaginationInfo.HasPrevious

	return &conn, nil
}

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

func (r *validatorResolver) VotingPower(ctx context.Context, obj *models.Validator) (float64, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return 0, err
	}

	if validator.VotingPower == nil {
		return 0, nil
	}

	return validator.VotingPower.RelativeVotingPower, nil
}

func (r *validatorResolver) ExpectedReturns(ctx context.Context, obj *models.Validator) (float64, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return 0, err
	}

	if validator.Commission == nil {
		return 0, nil
	}

	return validator.Commission.ExpectedReturns, nil
}

func (r *validatorResolver) Uptime(ctx context.Context, obj *models.Validator) (float64, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return 0, err
	}

	if validator.SigningInfo == nil {
		return 0, nil
	}

	return validator.SigningInfo.Uptime, nil
}

func (r *validatorResolver) ParticipatedProposalCount(ctx context.Context, obj *models.Validator) (int, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return 0, err
	}

	if validator.Info == nil {
		return 0, nil
	}

	return len(validator.Info.ProposalVotes), nil
}

func (r *validatorResolver) RelativeTotalProposalCount(ctx context.Context, obj *models.Validator) (int, error) {
	count, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadRelativeTotalProposalCountByConsensusAddress(obj.ConsensusAddress)
	if err != nil {
		return 0, err
	}

	if count == nil {
		return 0, err
	}

	return *count, nil
}

// Validator returns graphql1.ValidatorResolver implementation.
func (r *Resolver) Validator() graphql1.ValidatorResolver { return &validatorResolver{r} }

type validatorResolver struct{ *Resolver }
