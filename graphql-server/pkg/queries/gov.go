package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/config"
	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type IGovQuery interface {
	QueryGovParams() (*models.GovParams, error)
}

type GovQuery struct {
	ctx     context.Context
	config  config.Config
	session *bun.DB
}

func NewGovQuery(ctx context.Context, session *bun.DB) IGovQuery {
	return &GovQuery{ctx: ctx, session: session}
}

func (q *GovQuery) QueryGovParams() (*models.GovParams, error) {
	govParams := new(models.GovParams)
	err := q.session.NewSelect().Model(govParams).Where("one_row_id = true").Scan(q.ctx)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	return govParams, nil
}
