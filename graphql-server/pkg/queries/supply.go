package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/uptrace/bun"
)

type ISupplyQuery interface {
	QuerySupply() (*models.Supply, error)
}

type SupplyQuery struct {
	ctx     context.Context
	session *bun.DB
}

func NewSupplyQuery(ctx context.Context, session *bun.DB) ISupplyQuery {
	return &SupplyQuery{ctx: ctx, session: session}
}

func (q *SupplyQuery) QuerySupply() (*models.Supply, error) {
	supply := new(models.Supply)
	err := q.session.NewSelect().Model(supply).Limit(1).Scan(q.ctx)
	if err != nil {
		return nil, err
	}

	return supply, nil
}
