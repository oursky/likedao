package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"strconv"

	pkgContext "github.com/oursky/likedao/pkg/context"
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

func (r *proposalResolver) TallyResult(ctx context.Context, obj *models.Proposal) (*models.ProposalTallyResult, error) {
	tally, err := pkgContext.GetDataLoadersFromCtx(ctx).Proposal.LoadProposalTallyResult(obj.ID)
	if err != nil {
		return nil, err
	}
	return tally, nil
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

func (r *queryResolver) Proposals(ctx context.Context, input models.QueryProposalsInput) (*models.Connection[models.Proposal], error) {
	proposalQuery := pkgContext.GetQueriesFromCtx(ctx).Proposal
	if input.FollowingAddress != nil && *input.FollowingAddress != "" {
		proposalQuery = proposalQuery.ScopeRelatedAddress(*input.FollowingAddress)
	} else if input.Filter != nil {
		proposalQuery = proposalQuery.ScopeProposalStatus((*input.Filter).ToProposalStatus())
	}

	res, err := proposalQuery.QueryPaginatedProposals(input.First, input.After)
	if err != nil {
		return nil, err
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

// Proposal returns graphql1.ProposalResolver implementation.
func (r *Resolver) Proposal() graphql1.ProposalResolver { return &proposalResolver{r} }

// ProposalTallyResult returns graphql1.ProposalTallyResultResolver implementation.
func (r *Resolver) ProposalTallyResult() graphql1.ProposalTallyResultResolver {
	return &proposalTallyResultResolver{r}
}

type proposalResolver struct{ *Resolver }
type proposalTallyResultResolver struct{ *Resolver }
