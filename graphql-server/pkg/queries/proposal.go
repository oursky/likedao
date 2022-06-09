package queries

import (
	"context"
	"fmt"

	"github.com/oursky/likedao/pkg/config"
	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
	gql_bigint "github.com/xplorfin/gql-bigint"
)

type IProposalQuery interface {
	ScopeProposalStatus(filter models.ProposalStatus) IProposalQuery
	ScopeRelatedAddress(address string) IProposalQuery
	QueryPaginatedProposals(first int, after int) (*Paginated[models.Proposal], error)
	QueryProposalTallyResults(id []int) ([]*models.ProposalTallyResult, error)
	QueryProposalByIDs(ids []string) ([]*models.Proposal, error)
	QueryProposalDepositTotal(id int, config config.Config) (gql_bigint.BigInt, error)
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

func (q *ProposalQuery) QueryProposalTallyResults(ids []int) ([]*models.ProposalTallyResult, error) {
	tallyResults := make([]*models.ProposalTallyResult, 0, len(ids))
	if err := q.session.NewSelect().Model(&tallyResults).Where("proposal_id IN (?)", bun.In(ids)).Scan(q.ctx); err != nil {
		return nil, errors.WithStack(err)
	}

	result := make([]*models.ProposalTallyResult, 0, len(tallyResults))
	idToTallyResult := make(map[int]models.ProposalTallyResult, len(tallyResults))
	for _, tallyResult := range tallyResults {
		idToTallyResult[tallyResult.ProposalID] = *tallyResult
	}

	for _, id := range ids {
		tallyResult, exists := idToTallyResult[id]
		if exists {
			result = append(result, &tallyResult)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil
}

func (q *ProposalQuery) QueryProposalByIDs(ids []string) ([]*models.Proposal, error) {
	proposals := make([]*models.Proposal, len(ids))
	err := q.NewQuery().Where("id IN (?)", bun.In(ids)).Scan(q.ctx, &proposals)
	if err != nil {
		return nil, err
	}
	return proposals, nil
}

func (q *ProposalQuery) QueryProposalDepositTotal(id int, config config.Config) (gql_bigint.BigInt, error) {
	var res gql_bigint.BigInt
	rows, err := q.session.DB.QueryContext(q.ctx, fmt.Sprintf(
		`SELECT
			sum((deposit.coin).amount::BIGINT)
		FROM (
			SELECT
				unnest(proposal_deposit.amount) AS coin
			FROM
				%s.proposal_deposit
			WHERE
				proposal_deposit.proposal_id = %d
			) AS deposit
		where
			(deposit.coin).denom = '%s'
		GROUP BY
			(deposit.coin).denom;`, config.ChainDatabase.Schema, id, config.Chain.CoinDenom,
	))
	if err != nil {
		return 0, err
	}
	rows.Next()
	err = rows.Scan(&res)
	if err != nil {
		return 0, err
	}
	return res, nil
}
