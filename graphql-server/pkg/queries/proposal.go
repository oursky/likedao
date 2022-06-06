package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/config"
	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type IProposalQuery interface {
	ScopeProposalStatus(filter models.ProposalStatus) IProposalQuery
	ScopeRelatedAddress(address string) IProposalQuery
	QueryPaginatedProposals(first int, after int) (*Paginated[models.Proposal], error)
}

type ProposalQuery struct {
	ctx     context.Context
	config  config.Config
	session *bun.DB

	scopedProposalStatus models.ProposalStatus
	scopedRelatedAddress string
}

func NewProposalQuery(ctx context.Context, config config.Config, session *bun.DB) IProposalQuery {
	return &ProposalQuery{ctx: ctx, config: config, session: session}
}

func (q *ProposalQuery) NewQuery() *bun.SelectQuery {
	query := q.session.NewSelect().Model((*models.Proposal)(nil))

	if q.scopedProposalStatus != "" {
		query = query.Where("status = ?", q.scopedProposalStatus)
	}

	if q.scopedRelatedAddress != "" {

		relatedDeposits := q.session.NewSelect().Model((*models.ProposalDeposit)(nil)).Column("proposal_id").Where("depositor_address = ?", q.scopedRelatedAddress)
		relatedVotes := q.session.NewSelect().Model((*models.ProposalVote)(nil)).Column("proposal_id").Where("voter_address = ?", q.scopedRelatedAddress)

		relatedProposals := relatedDeposits.Union(relatedVotes)

		query = query.
			WhereOr("id IN (?)", relatedProposals).
			WhereOr("proposal.proposer_address = ?", q.scopedRelatedAddress)
	}

	return query
}

func (q *ProposalQuery) ScopeProposalStatus(status models.ProposalStatus) IProposalQuery {
	var newQuery = *q
	newQuery.scopedProposalStatus = status
	return &newQuery
}

func (q *ProposalQuery) ScopeRelatedAddress(address string) IProposalQuery {
	var newQuery = *q
	newQuery.scopedRelatedAddress = address
	return &newQuery
}

func (q *ProposalQuery) QueryPaginatedProposals(first int, after int) (*Paginated[models.Proposal], error) {
	query := q.NewQuery()

	totalCount, err := q.NewQuery().Count(q.ctx)
	if err != nil {
		return nil, err
	}

	// TODO: Handle search

	query = query.Order("submit_time DESC").Order("id DESC").Limit(first + 1).Offset(after)

	var proposals []models.Proposal
	if err := query.Scan(q.ctx, &proposals); err != nil {
		return nil, errors.WithStack(err)
	}

	hasNextPage := len(proposals) > after
	hasPreviousPage := after > 0

	if len(proposals) > first {
		proposals = proposals[:first]
	}

	return &Paginated[models.Proposal]{
		Items: proposals,
		PaginationInfo: PaginationInfo{
			HasNext:     hasNextPage,
			HasPrevious: hasPreviousPage,
			TotalCount:  totalCount,
		},
	}, nil

}
