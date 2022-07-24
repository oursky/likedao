package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type IValidatorQuery interface {
	WithProposalDeposits(proposalID int) IValidatorQuery
	WithProposalVotes(proposalID int) IValidatorQuery
	QueryPaginatedValidators(first int, after int, includeAddresses []string) (*Paginated[models.Validator], error)
	QueryValidatorsByConsensusAddresses(addresses []string) ([]*models.Validator, error)
	QueryValidatorsBySelfDelegationAddresses(addresses []string) ([]*models.Validator, error)
}

type ValidatorQuery struct {
	ctx     context.Context
	session *bun.DB

	withProposalVotesByProposalID    int
	withProposalDepositsByProposalID int
}

func NewValidatorQuery(ctx context.Context, session *bun.DB) IValidatorQuery {
	return &ValidatorQuery{ctx: ctx, session: session}
}

func (q *ValidatorQuery) WithProposalVotes(proposalID int) IValidatorQuery {
	var newQuery = *q
	newQuery.withProposalVotesByProposalID = proposalID
	return &newQuery
}

func (q *ValidatorQuery) WithProposalDeposits(proposalID int) IValidatorQuery {
	var newQuery = *q
	newQuery.withProposalDepositsByProposalID = proposalID
	return &newQuery
}

func (q *ValidatorQuery) NewQuery(model interface{}, includeAddresses []string) *bun.SelectQuery {
	query := q.session.NewSelect().
		// https://github.com/uptrace/bun/issues/410
		// Using model interface to avoid a bug where has-many fields are scanned as nil when using a nil model
		Model(model).
		Relation("Description").
		Relation("VotingPower", func(votingPowerQuery *bun.SelectQuery) *bun.SelectQuery {
			// Calculate the relative voting power = voting_power / sum(voting_power)
			totalVotingPowerQuery := q.session.NewSelect().Model((*models.ValidatorVotingPower)(nil)).ColumnExpr("SUM(voting_power)::BIGINT as total_voting_power")
			return votingPowerQuery.
				Column("validator_address", "voting_power", "height").
				ColumnExpr("(voting_power::decimal / (?)) as voting_power__relative_voting_power", totalVotingPowerQuery)
		}).
		// To handle gql resolving when info is provided but validator isn't
		Relation("Info.Validator")

	if len(includeAddresses) > 0 {
		query = query.Where("info.operator_address IN (?)", bun.In(includeAddresses))
	}

	if q.withProposalVotesByProposalID > 0 {
		query = query.Relation("Info.ProposalVotes", func(sq *bun.SelectQuery) *bun.SelectQuery {
			// Get the latest vote of a proposal
			return sq.Where("proposal_id = ?", q.withProposalVotesByProposalID).Limit(1)
		})
	}

	if q.withProposalDepositsByProposalID > 0 {
		query = query.Relation("Info.ProposalDeposits", func(sq *bun.SelectQuery) *bun.SelectQuery {
			return sq.Where("proposal_id IN (?)", q.withProposalDepositsByProposalID).Order("proposal_deposit.height DESC")
		})
	}

	return query
}

func (q *ValidatorQuery) QueryPaginatedValidators(first int, after int, includeAddresses []string) (*Paginated[models.Validator], error) {
	var validators []models.Validator
	query := q.NewQuery(&validators, includeAddresses)

	totalCount, err := q.NewQuery((*models.Validator)(nil), includeAddresses).Count(q.ctx)
	if err != nil {
		return nil, err
	}

	query.Order("moniker ASC").Order("operator_address ASC").Limit(first + 1).Offset(after)

	if err := query.Scan(q.ctx); err != nil {
		return nil, errors.WithStack(err)
	}

	hasNextPage := len(validators) > first
	hasPreviousPage := after > 0

	if len(validators) > first {
		validators = validators[:first]
	}

	return &Paginated[models.Validator]{
		Items: validators,
		PaginationInfo: PaginationInfo{
			HasNext:     hasNextPage,
			HasPrevious: hasPreviousPage,
			TotalCount:  totalCount,
		},
	}, nil
}

func (q *ValidatorQuery) QueryValidatorsByConsensusAddresses(addresses []string) ([]*models.Validator, error) {
	if len(addresses) == 0 {
		return []*models.Validator{}, nil
	}

	var validators []models.Validator
	err := q.NewQuery(&validators, []string{}).Where("validator.consensus_address IN (?)", bun.In(addresses)).Scan(q.ctx)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	result := make([]*models.Validator, 0, len(validators))
	addressToValidator := make(map[string]models.Validator, len(validators))
	for _, validator := range validators {
		addressToValidator[validator.ConsensusAddress] = validator
	}

	for _, address := range addresses {
		validator, exists := addressToValidator[address]
		if exists {
			result = append(result, &validator)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil

}

func (q *ValidatorQuery) QueryValidatorsBySelfDelegationAddresses(addresses []string) ([]*models.Validator, error) {
	if len(addresses) == 0 {
		return []*models.Validator{}, nil
	}

	var validators []models.Validator
	err := q.NewQuery(&validators, []string{}).Where("info.self_delegate_address IN (?)", bun.In(addresses)).Scan(q.ctx)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	result := make([]*models.Validator, 0, len(validators))
	addressToValidator := make(map[string]models.Validator, len(validators))
	for _, validator := range validators {
		addressToValidator[validator.Info.SelfDelegateAddress] = validator
	}

	for _, address := range addresses {
		validator, exists := addressToValidator[address]
		if exists {
			result = append(result, &validator)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil

}
