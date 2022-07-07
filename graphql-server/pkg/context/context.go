package context

import (
	"context"

	"github.com/oursky/likedao/pkg/config"
	"github.com/oursky/likedao/pkg/dataloaders"
	"github.com/oursky/likedao/pkg/mutators"
	"github.com/oursky/likedao/pkg/queries"
	"github.com/uptrace/bun"
)

type contextKey string

const (
	QueryContextKey      contextKey = "QueryContextKey"
	MutatorContextKey    contextKey = "MutatorContextKey"
	DataLoaderContextKey contextKey = "DataLoaderContextKey"
	DbContextKey         contextKey = "DbContextKey"
	ConfigContextKey     contextKey = "ConfigContextKey"
)

type QueryContext struct {
	Test          queries.ITestQuery
	Block         queries.IBlockQuery
	Chain         queries.IChainQuery
	CommunityPool queries.ICommunityPoolQuery
	Inflation     queries.IInflationQuery
	StakingPool   queries.IStakingPoolQuery
	Supply        queries.ISupplyQuery
	Proposal      queries.IProposalQuery
	Reaction      queries.IReactionQuery
	Validator     queries.IValidatorQuery
}

type MutatorContext struct {
	Test     mutators.ITestMutator
	Reaction mutators.IReactionMutator
}

type DataLoaderContext struct {
	Test      dataloaders.TestDataloader
	Block     dataloaders.BlockDataloader
	Proposal  dataloaders.ProposalDataloader
	Reaction  dataloaders.ReactionDataloader
	Validator dataloaders.ValidatorDataloader
}

type DatabaseContext struct {
	ServerDatabase *bun.DB
	ChainDatabase  *bun.DB
}

func NewRequestContext(
	ctx context.Context,
	serverDB *bun.DB,
	chainDB *bun.DB,
	config config.Config,
) context.Context {
	queries := QueryContext{
		Test:          queries.NewTestQuery(ctx, serverDB),
		Block:         queries.NewBlockQuery(ctx, chainDB),
		Chain:         queries.NewChainQuery(ctx, chainDB),
		CommunityPool: queries.NewCommunityPoolQuery(ctx, chainDB),
		Inflation:     queries.NewInflationQuery(ctx, chainDB),
		StakingPool:   queries.NewStakingPoolQuery(ctx, chainDB),
		Supply:        queries.NewSupplyQuery(ctx, chainDB),
		Proposal:      queries.NewProposalQuery(ctx, config, chainDB),
		Reaction:      queries.NewReactionQuery(ctx, serverDB),
		Validator:     queries.NewValidatorQuery(ctx, chainDB),
	}
	mutators := MutatorContext{
		Test:     mutators.NewTestMutator(ctx, serverDB),
		Reaction: mutators.NewReactionMutator(ctx, serverDB),
	}
	dataLoaders := DataLoaderContext{
		Test:      dataloaders.NewTestDataloader(queries.Test),
		Block:     dataloaders.NewBlockDataloader(queries.Block),
		Proposal:  dataloaders.NewProposalDataloader(queries.Proposal),
		Reaction:  dataloaders.NewReactionDataloader(queries.Reaction),
		Validator: dataloaders.NewValidatorDataloader(queries.Validator),
	}

	databases := DatabaseContext{
		ServerDatabase: serverDB,
		ChainDatabase:  chainDB,
	}

	ctx = context.WithValue(ctx, QueryContextKey, queries)
	ctx = context.WithValue(ctx, MutatorContextKey, mutators)
	ctx = context.WithValue(ctx, DataLoaderContextKey, dataLoaders)
	ctx = context.WithValue(ctx, DbContextKey, databases)
	ctx = context.WithValue(ctx, ConfigContextKey, config)

	return ctx
}

func GetQueriesFromCtx(ctx context.Context) QueryContext {
	return ctx.Value(QueryContextKey).(QueryContext)
}

func GetMutatorsFromCtx(ctx context.Context) MutatorContext {
	return ctx.Value(MutatorContextKey).(MutatorContext)
}

func GetDataLoadersFromCtx(ctx context.Context) DataLoaderContext {
	return ctx.Value(DataLoaderContextKey).(DataLoaderContext)
}

func GetDBFromCtx(ctx context.Context) DatabaseContext {
	return ctx.Value(DbContextKey).(DatabaseContext)
}

func GetConfigFromCtx(ctx context.Context) config.Config {
	return ctx.Value(ConfigContextKey).(config.Config)
}
