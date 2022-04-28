package mutators

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/uptrace/bun"
)

type ITestMutator interface {
	CreateTest(_string string, _int int) (*models.Test, error)
}

type TestMutator struct {
	ctx     context.Context
	session *bun.DB
}

func NewTestMutator(ctx context.Context, session *bun.DB) ITestMutator {
	return &TestMutator{ctx: ctx, session: session}
}

func (q *TestMutator) CreateTest(_string string, _int int) (*models.Test, error) {
	test := &models.Test{
		String: _string,
		Int:    _int,
	}
	_, err := q.session.NewInsert().Model(test).Exec(q.ctx)
	if err != nil {
		return nil, err
	}

	return test, nil
}
