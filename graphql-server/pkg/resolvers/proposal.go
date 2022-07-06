package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"strconv"

	"github.com/forbole/bdjuno/database/types"
	pkgContext "github.com/oursky/likedao/pkg/context"
	"github.com/oursky/likedao/pkg/dataloaders"
	servererrors "github.com/oursky/likedao/pkg/errors"
	graphql1 "github.com/oursky/likedao/pkg/generated/graphql"
	"github.com/oursky/likedao/pkg/models"
	gql_bigint "github.com/xplorfin/gql-bigint"
)

func (r *proposalResolver) ProposalID(ctx context.Context, obj *models.Proposal) (int, error) {
	return obj.ID, nil
}

func (r *proposalResolver) Type(ctx context.Context, obj *models.Proposal) (models.ProposalType, error) {
	proposalType := new(models.ProposalType)
	err := proposalType.UnmarshalGQL(obj.ProposalType)
	if err != nil {
		return "", nil
	}

	return *proposalType, nil
}

func (r *proposalResolver) DepositTotal(ctx context.Context, obj *models.Proposal) ([]types.DbDecCoin, error) {
	res, err := pkgContext.GetQueriesFromCtx(ctx).Proposal.QueryProposalDepositTotal(obj.ID)
	if err != nil {
		return []types.DbDecCoin{}, err
	}
	return res, nil
}

func (r *proposalResolver) TallyResult(ctx context.Context, obj *models.Proposal) (*models.ProposalTallyResult, error) {
	if obj.Status == models.ProposalStatusFailed || obj.Status == models.ProposalStatusInvalid || obj.Status == models.ProposalStatusDepositPeriod {
		return nil, nil
	}

	tally, err := pkgContext.GetDataLoadersFromCtx(ctx).Proposal.LoadProposalTallyResult(obj.ID)
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to load proposal tally result: %v", err))
	}
	return tally, nil
}

func (r *proposalResolver) Turnout(ctx context.Context, obj *models.Proposal) (*float64, error) {
	turnout, err := pkgContext.GetDataLoadersFromCtx(ctx).Proposal.LoadProposalTurnout(obj.ID)
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to load proposal turnout: %v", err))
	}
	if turnout == nil {
		return nil, nil
	}

	return turnout, nil
}

func (r *proposalResolver) Reactions(ctx context.Context, obj *models.Proposal) ([]models.ReactionCount, error) {
	reactionCounts, err := pkgContext.GetDataLoadersFromCtx(ctx).Reaction.LoadProposalReactionCount(obj.ID)
	if err != nil {
		return nil, err
	}

	var result []models.ReactionCount
	for _, reactionCount := range reactionCounts {
		result = append(result, models.ReactionCount{Reaction: reactionCount.Reaction, Count: reactionCount.Count})

	}

	return result, nil
}

func (r *proposalResolver) MyReaction(ctx context.Context, obj *models.Proposal) (*string, error) {
	userAddress := pkgContext.GetAuthedUserAddress(ctx)
	if userAddress == "" {
		return nil, nil
	}

	reaction, err := pkgContext.GetDataLoadersFromCtx(ctx).Reaction.LoadUserProposalReactions(dataloaders.UserProposalReactionKey{
		ProposalID:  obj.ID,
		UserAddress: userAddress,
	})
	if err != nil {
		return nil, err
	}

	if reaction == nil {
		return nil, nil
	}

	return &reaction.Reaction, nil
}

func (r *proposalResolver) Votes(ctx context.Context, obj *models.Proposal, input models.QueryProposalVotesInput) (*models.Connection[models.ProposalVote], error) {
	result := make([]models.ProposalVote, 0)

	validatorLimit := input.First
	validatorOffset := input.After
	// No need validators if no delegation or already went through all the validators
	if len(input.PinnedValidators) == 0 || input.After > len(input.PinnedValidators) {
		validatorLimit = 0
		validatorOffset = 0
	}

	validators, err := pkgContext.GetQueriesFromCtx(ctx).Validator.WithProposalVotes(obj.ID).QueryPaginatedValidators(validatorLimit, validatorOffset, input.PinnedValidators)
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to load validators: %v", err))
	}

	// Add validators to result
	validatorDelegationAddresses := make([]string, 0)
	for i := range validators.Items {
		validator := validators.Items[i]
		// There should only be at most one vote when scoped
		if validator.Info != nil && len(validator.Info.ProposalVotes) != 0 {
			result = append(result, *validator.Info.ProposalVotes[0])
		} else {
			result = append(result, models.ProposalVote{
				ProposalID:   obj.ID,
				VoterAddress: validator.Info.SelfDelegateAddress,
				Option:       "",
				Height:       validator.Info.Height,

				ValidatorInfo: validator.Info,
			})
		}

		validatorDelegationAddresses = append(validatorDelegationAddresses, validator.Info.SelfDelegateAddress)
	}

	voteLimit := input.First
	// Get the remaining vote items if the number of validators are fewer than the pageSize
	if len(validators.Items) < input.First {
		voteLimit = input.First - len(validators.Items)
	}

	// Skip votes if we already have enough items for a page
	if len(validators.Items) == input.First {
		voteLimit = 0
	}

	// Start offsetting the votes if we are done with the validators
	voteOffset := input.After
	if len(input.PinnedValidators) != 0 {
		voteOffset -= validators.PaginationInfo.TotalCount
	}
	if voteOffset < 0 {
		voteOffset = 0
	}

	votes, err := pkgContext.GetQueriesFromCtx(ctx).Proposal.QueryPaginatedProposalVotes(obj.ID, voteLimit, voteOffset, input.Order, validatorDelegationAddresses)
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to load proposal votes: %v", err))
	}

	// Add votes to result
	for i := range votes.Items {
		vote := votes.Items[i]
		result = append(result, vote)
	}

	voteWithValidatorCursorMap := make(map[string]string)
	for index, identity := range result {
		cursorString := strconv.Itoa(input.After + index + 1)
		voteWithValidatorCursorMap[identity.NodeID().String()] = cursorString

	}

	conn := models.NewConnection(result, func(model models.ProposalVote) string {
		return voteWithValidatorCursorMap[model.NodeID().String()]
	})

	totalCount := votes.PaginationInfo.TotalCount
	hasNextPage := votes.PaginationInfo.HasNext
	hasPreviousPage := votes.PaginationInfo.HasPrevious
	if validatorLimit != 0 {
		totalCount = totalCount + validators.PaginationInfo.TotalCount
		hasNextPage = validators.PaginationInfo.HasNext
		hasPreviousPage = validators.PaginationInfo.HasPrevious
	}

	conn.TotalCount = totalCount
	conn.PageInfo.HasNextPage = hasNextPage
	conn.PageInfo.HasPreviousPage = hasPreviousPage

	return &conn, nil
}

func (r *proposalResolver) Deposits(ctx context.Context, obj *models.Proposal, input models.QueryProposalDepositsInput) (*models.Connection[models.ProposalDeposit], error) {
	result := make([]models.ProposalDeposit, 0)

	validatorLimit := input.First
	validatorOffset := input.After
	// No need validators if no delegation or already went through all the validators
	if len(input.PinnedValidators) == 0 || input.After > len(input.PinnedValidators) {
		validatorLimit = 0
		validatorOffset = 0
	}

	validators, err := pkgContext.GetQueriesFromCtx(ctx).Validator.WithProposalDeposits(obj.ID).QueryPaginatedValidators(validatorLimit, validatorOffset, input.PinnedValidators)
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to load validators: %v", err))
	}

	// Add validators to result
	for i := range validators.Items {
		validator := validators.Items[i]
		if validator.Info != nil && len(validator.Info.ProposalDeposits) != 0 {
			result = append(result, *validator.Info.ProposalDeposits[0])
		} else {
			result = append(result, models.ProposalDeposit{
				ProposalID:       obj.ID,
				DepositorAddress: validator.Info.SelfDelegateAddress,
				Amount:           nil,
				Height:           validator.Info.Height,

				ValidatorInfo: validator.Info,
			})
		}
	}

	depositLimit := input.First
	// Get the remaining vote items if the number of validators are fewer than the pageSize
	if len(validators.Items) < input.First {
		depositLimit = input.First - len(validators.Items)
	}

	// Skip votes if we already have enough items for a page
	if len(validators.Items) == input.First {
		depositLimit = 0
	}

	// Start offsetting the votes if we are done with the validators
	depositOffset := input.After
	if len(input.PinnedValidators) != 0 {
		depositOffset -= validators.PaginationInfo.TotalCount
	}
	if depositOffset < 0 {
		depositOffset = 0
	}

	deposits, err := pkgContext.GetQueriesFromCtx(ctx).Proposal.QueryPaginatedProposalDeposits(obj.ID, depositLimit, depositOffset, input.Order, input.PinnedValidators)
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to load proposal votes: %v", err))
	}

	// Add votes to result
	for i := range deposits.Items {
		deposit := deposits.Items[i]
		result = append(result, deposit)
	}

	depositWithValidatorCursorMap := make(map[string]string)
	for index, identity := range result {
		cursorString := strconv.Itoa(input.After + index + 1)
		depositWithValidatorCursorMap[identity.NodeID().String()] = cursorString

	}

	conn := models.NewConnection(result, func(model models.ProposalDeposit) string {
		return depositWithValidatorCursorMap[model.NodeID().String()]
	})

	totalCount := deposits.PaginationInfo.TotalCount
	hasNextPage := deposits.PaginationInfo.HasNext
	hasPreviousPage := deposits.PaginationInfo.HasPrevious
	if validatorLimit != 0 {
		totalCount = totalCount + validators.PaginationInfo.TotalCount
		hasNextPage = validators.PaginationInfo.HasNext
		hasPreviousPage = validators.PaginationInfo.HasPrevious
	}

	conn.TotalCount = totalCount
	conn.PageInfo.HasNextPage = hasNextPage
	conn.PageInfo.HasPreviousPage = hasPreviousPage

	return &conn, nil
}

func (r *proposalDepositResolver) Depositor(ctx context.Context, obj *models.ProposalDeposit) (models.ProposalDepositor, error) {
	// Deposit is from a validator
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoBySelfDelegationAddress(obj.DepositorAddress)
	if err == nil && validator != nil {
		return validator, nil
	}

	// Deposit is from a depositor
	if obj.DepositorAddress != "" {
		return models.StringObject{
			Value: obj.DepositorAddress,
		}, nil
	}

	// Deposit is initial deposit by the proposer
	proposal, err := pkgContext.GetDataLoadersFromCtx(ctx).Proposal.Load(strconv.Itoa(obj.ProposalID))
	if err == nil && proposal != nil && proposal.ProposerAddress != "" {
		return models.StringObject{
			Value: proposal.ProposerAddress,
		}, nil
	}

	return nil, nil
}

func (r *proposalDepositResolver) Amount(ctx context.Context, obj *models.ProposalDeposit) ([]types.DbDecCoin, error) {
	coins := make([]types.DbDecCoin, 0, len(obj.Amount))
	for _, coin := range obj.Amount {
		coins = append(coins, types.DbDecCoin{
			Denom:  coin.Denom,
			Amount: coin.Amount,
		})
	}
	return coins, nil
}

func (r *proposalTallyResultResolver) Yes(ctx context.Context, obj *models.ProposalTallyResult) (gql_bigint.BigInt, error) {
	if obj.Yes == nil {
		return 0, nil
	}
	return gql_bigint.BigInt(obj.Yes.ToInt64()), nil
}

func (r *proposalTallyResultResolver) No(ctx context.Context, obj *models.ProposalTallyResult) (gql_bigint.BigInt, error) {
	if obj.No == nil {
		return 0, nil
	}
	return gql_bigint.BigInt(obj.No.ToInt64()), nil
}

func (r *proposalTallyResultResolver) NoWithVeto(ctx context.Context, obj *models.ProposalTallyResult) (gql_bigint.BigInt, error) {
	if obj.NoWithVeto == nil {
		return 0, nil
	}
	return gql_bigint.BigInt(obj.NoWithVeto.ToInt64()), nil
}

func (r *proposalTallyResultResolver) Abstain(ctx context.Context, obj *models.ProposalTallyResult) (gql_bigint.BigInt, error) {
	if obj.Abstain == nil {
		return 0, nil
	}
	return gql_bigint.BigInt(obj.Abstain.ToInt64()), nil
}

func (r *proposalTallyResultResolver) OutstandingOption(ctx context.Context, obj *models.ProposalTallyResult) (*models.ProposalVoteOption, error) {
	option := new(models.ProposalVoteOption)
	var votes = int64(0)

	// FIXME: Improve this handling
	if obj.Yes != nil && obj.Yes.ToInt64() > votes {
		*option = models.ProposalVoteOptionYes
		votes = obj.Yes.ToInt64()
	}

	if obj.No != nil && obj.No.ToInt64() > votes {
		*option = models.ProposalVoteOptionNo
		votes = obj.No.ToInt64()
	}

	if obj.NoWithVeto != nil && obj.NoWithVeto.ToInt64() > votes {
		*option = models.ProposalVoteOptionNoWithVeto
		votes = obj.NoWithVeto.ToInt64()
	}

	if obj.Abstain != nil && obj.Abstain.ToInt64() > votes {
		*option = models.ProposalVoteOptionAbstain
	}

	// All the votes are the same, no outstanding option
	if *option == "" {
		return nil, nil
	}

	return option, nil
}

func (r *proposalVoteResolver) Voter(ctx context.Context, obj *models.ProposalVote) (models.ProposalVoter, error) {
	validator, err := pkgContext.GetDataLoadersFromCtx(ctx).Validator.LoadValidatorWithInfoBySelfDelegationAddress(obj.VoterAddress)
	if err == nil && validator != nil {
		return validator, nil
	}

	return models.StringObject{
		Value: obj.VoterAddress,
	}, nil
}

func (r *proposalVoteResolver) Option(ctx context.Context, obj *models.ProposalVote) (*models.ProposalVoteOption, error) {
	if obj.Option == "" {
		return nil, nil
	}

	return &obj.Option, nil
}

func (r *queryResolver) Proposals(ctx context.Context, input models.QueryProposalsInput) (*models.Connection[models.Proposal], error) {
	proposalQuery := pkgContext.GetQueriesFromCtx(ctx).Proposal
	if input.Address != nil {
		if !input.Address.IsDepositor && !input.Address.IsSubmitter && !input.Address.IsVoter {
			return nil, servererrors.BadUserInput.NewError(
				ctx,
				"invalid address filter: at least one of isDepositor, isSubmitter, isVoter in address filter should be true",
			)
		}
		proposalQuery = proposalQuery.ScopeProposalAddress(input.Address)
	}
	if input.Status != nil {
		proposalQuery = proposalQuery.ScopeProposalStatus((*input.Status).ToProposalStatus())
	}

	res, err := proposalQuery.QueryPaginatedProposals(input.First, input.After)
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to load proposals: %v", err))
	}
	proposalCursorMap := make(map[int]string)
	for index, proposal := range res.Items {
		cursorString := strconv.Itoa(input.After + index + 1)
		proposalCursorMap[proposal.ID] = cursorString
	}

	conn := models.NewConnection(res.Items, func(model models.Proposal) string {
		return proposalCursorMap[model.ID]
	})
	conn.TotalCount = res.PaginationInfo.TotalCount
	conn.PageInfo.HasNextPage = res.PaginationInfo.HasNext
	conn.PageInfo.HasPreviousPage = res.PaginationInfo.HasPrevious

	return &conn, nil
}

func (r *queryResolver) ProposalByID(ctx context.Context, id models.NodeID) (*models.Proposal, error) {
	res, err := pkgContext.GetDataLoadersFromCtx(ctx).Proposal.Load(id.ID)
	if err != nil {
		return nil, err
	}
	return res, nil
}

// Proposal returns graphql1.ProposalResolver implementation.
func (r *Resolver) Proposal() graphql1.ProposalResolver { return &proposalResolver{r} }

// ProposalDeposit returns graphql1.ProposalDepositResolver implementation.
func (r *Resolver) ProposalDeposit() graphql1.ProposalDepositResolver {
	return &proposalDepositResolver{r}
}

// ProposalTallyResult returns graphql1.ProposalTallyResultResolver implementation.
func (r *Resolver) ProposalTallyResult() graphql1.ProposalTallyResultResolver {
	return &proposalTallyResultResolver{r}
}

// ProposalVote returns graphql1.ProposalVoteResolver implementation.
func (r *Resolver) ProposalVote() graphql1.ProposalVoteResolver { return &proposalVoteResolver{r} }

type proposalResolver struct{ *Resolver }
type proposalDepositResolver struct{ *Resolver }
type proposalTallyResultResolver struct{ *Resolver }
type proposalVoteResolver struct{ *Resolver }
