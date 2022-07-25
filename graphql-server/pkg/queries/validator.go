package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/config"
	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type IValidatorQuery interface {
	WithProposalDeposits() IValidatorQuery
	WithProposalVotes() IValidatorQuery
	QueryPaginatedValidators(first int, after int, includeAddresses []string) (*Paginated[models.Validator], error)
	QueryValidatorsByConsensusAddresses(addresses []string) ([]*models.Validator, error)
	QueryValidatorsBySelfDelegationAddresses(addresses []string) ([]*models.Validator, error)
	QueryRelativeTotalProposalCounts(addresses []string) ([]*int, error)
}

type ValidatorQuery struct {
	ctx     context.Context
	session *bun.DB
	config  config.Config

	withProposalVotes    bool
	withProposalDeposits bool
}

func NewValidatorQuery(ctx context.Context, config config.Config, session *bun.DB) IValidatorQuery {
	return &ValidatorQuery{ctx: ctx, config: config, session: session}
}

func (q *ValidatorQuery) WithProposalVotes() IValidatorQuery {
	var newQuery = *q
	newQuery.withProposalVotes = true
	return &newQuery
}

func (q *ValidatorQuery) WithProposalDeposits() IValidatorQuery {
	var newQuery = *q
	newQuery.withProposalDeposits = true
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
		Relation("Commission", func(commissionQuery *bun.SelectQuery) *bun.SelectQuery {
			// Calculate expected returns = (1 - commission_rate) * (inflation * supply) / bonded_tokens
			inflationQuery := q.session.NewSelect().Model((*models.Inflation)(nil)).Column("value").Limit(1)
			supplyQuery := q.session.NewSelect().Model((*models.Supply)(nil)).ColumnExpr("unnest(coins) AS coin")
			nativeSupplyQuery := q.session.NewSelect().
				ColumnExpr("((supply.coin).amount::numeric) as native_supply").
				TableExpr("(?) as supply", supplyQuery).
				Where("(supply.coin).denom = ?", q.config.Chain.CoinDenom).
				Limit(1)
			bondedPoolQuery := q.session.NewSelect().Model((*models.StakingPool)(nil)).Column("bonded_tokens").Limit(1)

			return commissionQuery.
				Column("validator_address", "commission", "min_self_delegation", "height").
				ColumnExpr("(((1 - commission::decimal) * ((?) * (?))) / (?)::numeric) as commission__expected_returns", inflationQuery, nativeSupplyQuery, bondedPoolQuery)
		}).
		Relation("SigningInfo", func(signingInfoQuery *bun.SelectQuery) *bun.SelectQuery {
			// Calculate uptime = (1 - signing_info.missed_blocks / (latest_block.height - signing_info.start_height))
			latestBlockQuery := q.session.NewSelect().Model((*models.Block)(nil)).Order("timestamp DESC").Column("height").Limit(1)
			return signingInfoQuery.
				Column("validator_address", "start_height", "index_offset", "jailed_until", "tombstoned", "missed_blocks_counter", "height").
				ColumnExpr("(1 - (missed_blocks_counter::decimal / ((?) - start_height::decimal))) as signing_info__uptime", latestBlockQuery)
		}).
		// To handle gql resolving when info is provided but validator isn't
		Relation("Info.Validator")

	if len(includeAddresses) > 0 {
		query = query.Where("info.operator_address IN (?)", bun.In(includeAddresses))
	}

	if q.withProposalVotes {
		query = query.Relation("Info.ProposalVotes")
	}

	if q.withProposalDeposits {
		query = query.Relation("Info.ProposalDeposits", func(sq *bun.SelectQuery) *bun.SelectQuery {
			return sq.Order("proposal_deposit.height DESC")
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

func (q *ValidatorQuery) QueryRelativeTotalProposalCounts(addresses []string) ([]*int, error) {
	if len(addresses) == 0 {
		return []*int{}, nil
	}

	var counts []models.DBRelativeTotalProposalCount
	err := q.session.NewSelect().
		Model((*models.Validator)(nil)).
		Relation("SigningInfo", func(votingPowerQuery *bun.SelectQuery) *bun.SelectQuery {
			return votingPowerQuery.Column("start_height")
		}).
		ColumnExpr("validator.consensus_address, (?) as proposal_count", q.session.
			NewSelect().
			Model((*models.Proposal)(nil)).
			ColumnExpr("COUNT(id)").
			Where("submit_time >= block.timestamp").
			WhereOr("signing_info.start_height = 0")).
		Join("LEFT JOIN block ON signing_info.start_height = block.height").
		Where("validator.consensus_address IN (?)", bun.In(addresses)).
		Scan(q.ctx, &counts)

	fmt.Printf("%+v\n", counts)

	if err != nil {
		return nil, errors.WithStack(err)
	}

	result := make([]*int, 0, len(counts))
	addressToCount := make(map[string]int, len(counts))
	for _, proposalCount := range counts {
		addressToCount[proposalCount.ConsensusAddress] = proposalCount.ProposalCount
	}

	for _, address := range addresses {
		count, exists := addressToCount[address]
		if exists {
			result = append(result, &count)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil
}
