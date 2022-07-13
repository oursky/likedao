package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"math/big"
	"strconv"
	"strings"

	bdjuno "github.com/forbole/bdjuno/database/types"
	pkgContext "github.com/oursky/likedao/pkg/context"
	servererrors "github.com/oursky/likedao/pkg/errors"
	"github.com/oursky/likedao/pkg/models"
)

func (r *queryResolver) AverageBlockTime(ctx context.Context) (float64, error) {
	averageBlockTime, err := pkgContext.GetQueriesFromCtx(ctx).Chain.QueryAvergeBlockTime()
	if err != nil {
		return 0, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to query average block time: %v", err))
	}

	return averageBlockTime.AverageTime, nil
}

func (r *queryResolver) CommunityStatus(ctx context.Context) (*models.CommunityStatus, error) {
	config := pkgContext.GetConfigFromCtx(ctx)
	communityPool, err := pkgContext.GetQueriesFromCtx(ctx).CommunityPool.QueryCommunityPool()
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to query community pool: %v", err))
	}

	var communityPoolCoins []bdjuno.DbDecCoin
	for _, coin := range communityPool.Coins {
		// Discard values after decimal point
		strValue := strings.Split(coin.Amount, ".")
		communityPoolCoins = append(communityPoolCoins, bdjuno.DbDecCoin{
			Denom:  coin.Denom,
			Amount: strValue[0],
		})
	}

	inflation, err := pkgContext.GetQueriesFromCtx(ctx).Inflation.QueryInflation()
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to query inflation: %v", err))
	}

	supply, err := pkgContext.GetQueriesFromCtx(ctx).Supply.QuerySupply()
	if err != nil {
		return nil, err
	}
	var nativeSupply *bdjuno.DbDecCoin
	for _, coin := range supply.Coins {
		if coin.Denom == config.Chain.CoinDenom {
			nativeSupply = coin
			break
		}
	}
	if nativeSupply == nil {
		return nil, servererrors.NotFound.NewError(ctx, "native supply not found")
	}

	parsedSupplyAmount, err := strconv.ParseFloat(nativeSupply.Amount, 64)
	if err != nil {
		return nil, servererrors.ValidationFailure.NewError(ctx, fmt.Sprintf("failed to parse native supply amount: %v", err))
	}

	stakingPool, err := pkgContext.GetQueriesFromCtx(ctx).StakingPool.QueryStakingPool()
	if err != nil {
		return nil, servererrors.QueryError.NewError(ctx, fmt.Sprintf("failed to query staking pool: %v", err))
	}

	bondedRatio := new(big.Float).Quo(new(big.Float).SetInt(stakingPool.BondedTokens.ToMathBig()), new(big.Float).SetFloat64(parsedSupplyAmount))
	roundedBoundRatio, _ := bondedRatio.Float64()

	return &models.CommunityStatus{
		CommunityPool: communityPoolCoins,
		Inflation:     fmt.Sprintf("%f", inflation.Value),
		BondedRatio:   fmt.Sprintf("%f", roundedBoundRatio),
	}, nil
}
