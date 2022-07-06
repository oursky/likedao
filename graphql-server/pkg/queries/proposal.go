package queries

import (
	"context"
	"fmt"

	"github.com/forbole/bdjuno/database/types"
	"github.com/oursky/likedao/pkg/config"
	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type IProposalQuery interface {
	ScopeProposalStatus(filter models.ProposalStatus) IProposalQuery
	ScopeProposalAddress(filter *models.ProposalAddressFilter) IProposalQuery
	QueryPaginatedProposalDeposits(proposalID int, first int, after int, orderBy *models.ProposalDepositSort, excludeAddresses []string) (*Paginated[models.ProposalDeposit], error)
	QueryPaginatedProposalVotes(proposalID int, first int, after int, orderBy *models.ProposalVoteSort, excludeAddresses []string) (*Paginated[models.ProposalVote], error)
	QueryPaginatedProposals(first int, after int) (*Paginated[models.Proposal], error)
	QueryProposalTallyResults(id []int) ([]*models.ProposalTallyResult, error)
	QueryProposalByIDs(ids []string) ([]*models.Proposal, error)
	QueryProposalDepositTotal(id int) ([]types.DbDecCoin, error)
	QueryTurnoutByProposalIDs(ids []int) ([]*float64, error)
	QueryProposalVotes(keys []models.ProposalVoteKey) ([]*models.ProposalVote, error)
	QueryProposalDeposits(keys []models.ProposalDepositKey) ([]*models.ProposalDeposit, error)
}

type ProposalQuery struct {
	ctx     context.Context
	config  config.Config
	session *bun.DB

	scopedProposalStatus models.ProposalStatus
	scopedAddressFilter  *models.ProposalAddressFilter
}

func NewProposalQuery(ctx context.Context, config config.Config, session *bun.DB) IProposalQuery {
	return &ProposalQuery{ctx: ctx, config: config, session: session}
}

// generate new select query with filters applied.
// when both status and address filters are applied, results satisfying both filters are returned.
// when multiple sub-filters in address filter (ie. isDepositor, IsSubmitter, IsVoter), results satisfying
// any one of the sub-filters are returned
func (q *ProposalQuery) NewQuery() *bun.SelectQuery {
	query := q.session.NewSelect().Model((*models.Proposal)(nil))

	if q.scopedProposalStatus != "" {
		query = query.Where("status = ?", q.scopedProposalStatus)
	}

	if q.scopedAddressFilter != nil {

		query = query.WhereGroup(" AND ", func(query *bun.SelectQuery) *bun.SelectQuery {
			if q.scopedAddressFilter.IsDepositor {
				depositedProposalIDs := q.session.NewSelect().
					Model((*models.ProposalDeposit)(nil)).
					Column("proposal_id").
					Where("depositor_address = ?", q.scopedAddressFilter.Address)
				query = query.WhereOr("id IN (?)", depositedProposalIDs)
			}
			if q.scopedAddressFilter.IsVoter {
				votedProposalIDs := q.session.NewSelect().
					Model((*models.ProposalVote)(nil)).
					Column("proposal_id").
					Where("voter_address = ?", q.scopedAddressFilter.Address)
				query = query.WhereOr("id IN (?)", votedProposalIDs)
			}

			if q.scopedAddressFilter.IsSubmitter {
				query = query.WhereOr("proposal.proposer_address = ?", q.scopedAddressFilter.Address)
			}
			return query
		})
	}

	return query
}

func (q *ProposalQuery) ScopeProposalStatus(status models.ProposalStatus) IProposalQuery {
	var newQuery = *q
	newQuery.scopedProposalStatus = status
	return &newQuery
}

func (q *ProposalQuery) ScopeProposalAddress(filter *models.ProposalAddressFilter) IProposalQuery {
	var newQuery = *q
	newQuery.scopedAddressFilter = filter
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

	hasNextPage := len(proposals) > first
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

func (q *ProposalQuery) NewProposalVotesQuery(proposalID int, excludeAddresses []string) *bun.SelectQuery {
	query := q.session.NewSelect().Model((*models.ProposalVote)(nil)).Where("proposal_id = ?", proposalID)

	if len(excludeAddresses) != 0 {
		query = query.Where("voter_address NOT IN (?)", bun.In(excludeAddresses))
	}

	return query
}
func (q *ProposalQuery) QueryPaginatedProposalVotes(proposalID int, first int, after int, orderBy *models.ProposalVoteSort, excludeAddresses []string) (*Paginated[models.ProposalVote], error) {
	totalCount, err := q.NewProposalVotesQuery(proposalID, excludeAddresses).Count(q.ctx)
	if err != nil {
		return nil, err
	}

	var votes []models.ProposalVote
	query := q.NewProposalVotesQuery(proposalID, excludeAddresses).
		Relation("ValidatorInfo.Validator.Description")

	if orderBy.Voter != nil {
		query = query.Order(fmt.Sprintf("moniker %s", orderBy.Voter)).Order(fmt.Sprintf("voter_address %s", orderBy.Voter))
	} else if orderBy.Option != nil {
		query = query.Order(fmt.Sprintf("option %s", orderBy.Option))
	} else {
		query = query.Order("height DESC")
	}

	query = query.Limit(first + 1).
		Offset(after)

	err = query.Scan(q.ctx, &votes)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	hasNextPage := len(votes) > first
	hasPreviousPage := after > 0

	if len(votes) > first {
		votes = votes[:first]
	}

	return &Paginated[models.ProposalVote]{
		Items: votes,
		PaginationInfo: PaginationInfo{
			HasNext:     hasNextPage,
			HasPrevious: hasPreviousPage,
			TotalCount:  totalCount,
		},
	}, nil

}

func (q *ProposalQuery) NewProposalDepositQuery(proposalID int, excludeAddresses []string) *bun.SelectQuery {
	query := q.session.NewSelect().Model((*models.ProposalDeposit)(nil)).Where("proposal_id = ?", proposalID)

	if len(excludeAddresses) != 0 {
		query = query.Where("depositor_address NOT IN (?)", bun.In(excludeAddresses))
	}

	return query
}
func (q *ProposalQuery) QueryPaginatedProposalDeposits(proposalID int, first int, after int, orderBy *models.ProposalDepositSort, excludeAddresses []string) (*Paginated[models.ProposalDeposit], error) {
	totalCount, err := q.NewProposalDepositQuery(proposalID, excludeAddresses).Count(q.ctx)
	if err != nil {
		return nil, err
	}

	var deposits []models.ProposalDeposit
	query := q.NewProposalDepositQuery(proposalID, excludeAddresses).
		Relation("ValidatorInfo.Validator.Description")

	if orderBy.Depositor != nil {
		query = query.Order(fmt.Sprintf("moniker %s", orderBy.Depositor)).Order(fmt.Sprintf("depositor_address %s", orderBy.Depositor))
	} else if orderBy.Amount != nil {
		query = query.Order(fmt.Sprintf("amount %s", orderBy.Amount))
	} else {
		query = query.Order("height DESC")
	}

	query = query.Limit(first + 1).
		Offset(after)

	err = query.Scan(q.ctx, &deposits)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	hasNextPage := len(deposits) > first
	hasPreviousPage := after > 0

	if len(deposits) > first {
		deposits = deposits[:first]
	}

	return &Paginated[models.ProposalDeposit]{
		Items: deposits,
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
	if len(ids) == 0 {
		return []*models.Proposal{}, nil
	}
	proposals := make([]*models.Proposal, len(ids))
	err := q.NewQuery().Where("id IN (?)", bun.In(ids)).Scan(q.ctx, &proposals)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	// Reorder query results by order of input ids
	result := make([]*models.Proposal, 0, len(proposals))
	idToProposal := make(map[string]models.Proposal, len(proposals))
	for _, proposal := range proposals {
		idToProposal[proposal.NodeID().ID] = *proposal
	}

	for _, id := range ids {
		proposal, exists := idToProposal[id]
		if exists {
			result = append(result, &proposal)
		} else {
			result = append(result, nil)
		}
	}
	return result, nil
}

func (q *ProposalQuery) QueryProposalDepositTotal(id int) ([]types.DbDecCoin, error) {
	var res []types.DbDecCoin
	depositCoinsQuery := q.session.NewSelect().
		Model((*models.ProposalDeposit)(nil)).
		ColumnExpr("unnest(amount) AS coin").
		Where("proposal_id = ?", id)

	query := q.session.NewSelect().
		ColumnExpr("(deposit.coin).denom, SUM((deposit.coin).amount::BIGINT) as amount").
		TableExpr("(?) AS deposit", depositCoinsQuery).
		GroupExpr("(deposit.coin).denom")

	err := query.Scan(q.ctx, &res)
	if err != nil {
		return []types.DbDecCoin{}, err
	}
	return res, nil
}

func (q *ProposalQuery) QueryTurnoutByProposalIDs(ids []int) ([]*float64, error) {
	var turnouts []models.ProposalTurnout
	err := q.session.NewSelect().
		Model((*models.ProposalTallyResult)(nil)).
		Column("proposal_id").
		ColumnExpr(`(
				proposal_tally_result.yes::bigint + 
				proposal_tally_result.no::bigint + 
				proposal_tally_result.abstain::bigint + 
				proposal_tally_result.no_with_veto::bigint
			) / staking_pool.bonded_tokens::numeric as turnout`).
		Join(`
			INNER JOIN proposal_staking_pool_snapshot AS staking_pool 
			ON staking_pool.proposal_id = proposal_tally_result.proposal_id
		`).
		Where("proposal_tally_result.proposal_id IN (?)", bun.In(ids)).
		Scan(q.ctx, &turnouts)

	if err != nil {
		return nil, errors.WithStack(err)
	}

	// Reorder query results by order of input ids
	result := make([]*float64, 0, len(turnouts))
	idToTurnout := make(map[int]models.ProposalTurnout, len(turnouts))
	for _, turnout := range turnouts {
		idToTurnout[turnout.ProposalID] = turnout
	}

	for _, id := range ids {
		turnout, exists := idToTurnout[id]
		if exists {
			result = append(result, &turnout.Turnout)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil
}

func (q *ProposalQuery) QueryProposalVotes(keys []models.ProposalVoteKey) ([]*models.ProposalVote, error) {
	if len(keys) == 0 {
		return nil, nil
	}
	var votes []*models.ProposalVote
	err := q.session.NewSelect().
		With("keys", q.session.NewValues(&keys).WithOrder()).
		Model(&votes).
		Join("INNER JOIN keys ON (proposal_vote.proposal_id, proposal_vote.voter_address) = (keys.proposal_id, keys.address)").
		Scan(q.ctx)
	if err != nil {
		return nil, err
	}

	// Reorder query results by order of input keys
	result := make([]*models.ProposalVote, 0, len(votes))
	keyToVote := make(map[models.ProposalVoteKey]models.ProposalVote, len(votes))
	for _, vote := range votes {
		keyToVote[models.ProposalVoteKey{ProposalID: vote.ProposalID, Address: vote.VoterAddress}] = *vote
	}

	for _, key := range keys {
		vote, exists := keyToVote[key]
		if exists {
			result = append(result, &vote)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil
}

func (q *ProposalQuery) QueryProposalDeposits(keys []models.ProposalDepositKey) ([]*models.ProposalDeposit, error) {
	if len(keys) == 0 {
		return nil, nil
	}
	var deposits []*models.ProposalDeposit
	err := q.session.NewSelect().
		With("keys", q.session.NewValues(&keys).WithOrder()).
		Model(&deposits).
		Join(", keys").
		Where("(proposal_deposit.proposal_id, proposal_deposit.depositor_address) = (keys.proposal_id, keys.address)").
		Scan(q.ctx)
	if err != nil {
		return nil, err
	}

	// Reorder query results by order of input keys
	result := make([]*models.ProposalDeposit, 0, len(deposits))
	keyToVote := make(map[models.ProposalDepositKey]models.ProposalDeposit, len(deposits))
	for _, deposit := range deposits {
		keyToVote[models.ProposalDepositKey{ProposalID: deposit.ProposalID, Address: deposit.DepositorAddress}] = *deposit
	}

	for _, key := range keys {
		deposit, exists := keyToVote[key]
		if exists {
			result = append(result, &deposit)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil
}
