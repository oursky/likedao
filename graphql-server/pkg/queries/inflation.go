package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/uptrace/bun"
)

type IInflationQuery interface {
	QueryInflation() (*models.Inflation, error)
}

type InflationQuery struct {
	ctx     context.Context
	session *bun.DB
}

func NewInflationQuery(ctx context.Context, session *bun.DB) IInflationQuery {
	return &InflationQuery{ctx: ctx, session: session}
}

func (q *InflationQuery) QueryInflation() (*models.Inflation, error) {
	inflation := new(models.Inflation)
	err := q.session.NewSelect().Model(inflation).Limit(1).Scan(q.ctx)
	if err != nil {
		return nil, err
	}

	return inflation, nil
}
