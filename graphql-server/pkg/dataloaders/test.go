package dataloaders

import (
	godataloader "github.com/cychiuae/go-dataloader"
	"github.com/oursky/likedao/pkg/models"
	"github.com/oursky/likedao/pkg/queries"
)

type TestDataloader interface {
	Load(id string) (*models.Test, error)
	LoadAll(ids []string) ([]*models.Test, []error)
}

func NewTestDataloader(testQuery queries.ITestQuery) TestDataloader {
	return godataloader.NewDataLoader(godataloader.DataLoaderConfig[string, *models.Test]{
		Fetch: func(testIDs []string) ([]*models.Test, []error) {
			tests, err := testQuery.QueryTestsByIDs(testIDs)
			if err != nil {
				errors := make([]error, 0, len(testIDs))
				for range testIDs {
					errors = append(errors, err)
				}
				return nil, errors
			}
			return tests, nil
		},
		MaxBatch: DefaultMaxBatch,
		Wait:     DefaultWait,
	})
}
