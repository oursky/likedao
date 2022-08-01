package queries

import (
	"context"

	"github.com/oursky/likedao/pkg/models"
	"github.com/pkg/errors"
	"github.com/uptrace/bun"
)

type ITestQuery interface {
	QueryTestByID(id string) (*models.Test, error)
	QueryTestsByIDs(ids []string) ([]*models.Test, error)
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

func (q *TestQuery) QueryTestsByIDs(ids []string) ([]*models.Test, error) {
	if len(ids) == 0 {
		return []*models.Test{}, nil
	}

	tests := make([]models.Test, 0)
	if err := q.session.NewSelect().Model(&tests).Where("id IN (?)", bun.In(ids)).Scan(q.ctx); err != nil {
		return nil, errors.WithStack(err)
	}

	result := make([]*models.Test, 0, len(tests))
	idToTest := make(map[string]models.Test, len(tests))
	for _, test := range tests {
		idToTest[test.ID] = test
	}

	for _, id := range ids {
		test, exists := idToTest[id]
		if exists {
			result = append(result, &test)
		} else {
			result = append(result, nil)
		}
	}

	return result, nil
}
