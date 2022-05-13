package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/uptrace/bun"
)

type ITestQuery interface {
	QueryTestByID(id string) (*models.Test, error)
}

type TestQuery struct {
	ctx     context.Context
	session *bun.DB
}

func NewTestQuery(ctx context.Context, session *bun.DB) ITestQuery {
	return &TestQuery{ctx: ctx, session: session}
}

func (q *TestQuery) QueryTestByID(id string) (*models.Test, error) {
	test := new(models.Test)
	err := q.session.NewSelect().Model(test).Where("id = ?", id).Scan(q.ctx)
	if err != nil {
		return nil, err
	}

	return test, nil
}
