package context

import (
	"context"

	"github.com/oursky/likedao/pkg/dataloaders"
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
	Test  queries.ITestQuery
	Block queries.IBlockQuery
}

type MutatorContext struct {
	Test mutators.ITestMutator
}

type DataLoaderContext struct {
	Test dataloaders.TestDataloader
}

type DatabaseContext struct {
	ServerDatabase *bun.DB
	ChainDatabase  *bun.DB
}

func NewRequestContext(
	ctx context.Context,
	serverDB *bun.DB,
	chainDB *bun.DB,
) context.Context {
	queries := QueryContext{
		Test:  queries.NewTestQuery(ctx, serverDB),
		Block: queries.NewBlockQuery(ctx, chainDB),
	}
	mutators := MutatorContext{
		Test: mutators.NewTestMutator(ctx, serverDB),
	}
	dataLoaders := DataLoaderContext{
		Test: dataloaders.NewTestDataloader(queries.Test),
	}

	databases := DatabaseContext{
		ServerDatabase: serverDB,
		ChainDatabase:  chainDB,
	}

	ctx = context.WithValue(ctx, queryContextKey, queries)
	ctx = context.WithValue(ctx, mutatorContextKey, mutators)
	ctx = context.WithValue(ctx, dataLoaderContextKey, dataLoaders)
	ctx = context.WithValue(ctx, dbContextKey, databases)

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

func GetDBFromCtx(ctx context.Context) DatabaseContext {
	return ctx.Value(dbContextKey).(DatabaseContext)
}
