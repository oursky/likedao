package context

import (
	"context"

	"github.com/oursky/likedao/pkg/mutators"
	"github.com/oursky/likedao/pkg/queries"
	"github.com/uptrace/bun"
)

type contextKey string

const (
	queryContextKey      contextKey = "queryContextKey"
	mutatorContextKey    contextKey = "mutatorContextKey"
	dataLoaderContextKey contextKey = "dataLoaderContextKey"
	dbContextKey         contextKey = "dbContextKey"
)

type QueryContext struct {
	Test queries.TestQuery
}

type MutatorContext struct {
	Test mutators.TestMutator
}

type DataLoaderContext struct{}

func NewRequestContext(
	ctx context.Context,
	db *bun.DB,
) context.Context {
	queries := QueryContext{
		Test: queries.NewTestQuery(ctx, db),
	}
	mutators := MutatorContext{
		Test: mutators.NewTestMutator(ctx, db),
	}
	dataLoaders := DataLoaderContext{}

	ctx = context.WithValue(ctx, queryContextKey, queries)
	ctx = context.WithValue(ctx, mutatorContextKey, mutators)
	ctx = context.WithValue(ctx, dataLoaderContextKey, dataLoaders)
	ctx = context.WithValue(ctx, dbContextKey, db)

	return ctx
}

func GetQueriesFromCtx(ctx context.Context) QueryContext {
	return ctx.Value(queryContextKey).(QueryContext)
}

func GetMutatorsFromCtx(ctx context.Context) MutatorContext {
	return ctx.Value(mutatorContextKey).(MutatorContext)
}

func GetDataLoadersFromCtx(ctx context.Context) DataLoaderContext {
	return ctx.Value(dataLoaderContextKey).(DataLoaderContext)
}

func GetDBFromCtx(ctx context.Context) *bun.DB {
	return ctx.Value(dbContextKey).(*bun.DB)
}
