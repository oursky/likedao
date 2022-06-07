package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/config"
	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type IProposalQuery interface {
	QueryPaginatedProposals(first int, after int) (*Paginated[models.Proposal], error)
}

type ProposalQuery struct {
	ctx     context.Context
	config  config.Config
	session *bun.DB
}

func NewProposalQuery(ctx context.Context, config config.Config, session *bun.DB) IProposalQuery {
	return &ProposalQuery{ctx: ctx, config: config, session: session}
}

func (q *ProposalQuery) QueryPaginatedProposals(first int, after int) (*Paginated[models.Proposal], error) {

	query := q.session.NewSelect().Model((*models.Proposal)(nil))

	totalCount, err := q.session.NewSelect().Model((*models.Proposal)(nil)).Count(q.ctx)
	if err != nil {
		return nil, err
	}

	// TODO: Handle search
	// TODO: Handle filters

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
