import { useCallback, useState } from "react";
import { differenceInSeconds } from "date-fns";
import BigNumber from "bignumber.js";
import {
  AppSideBarQueryAverageBlockTime,
  AppSideBarQueryAverageBlockTimeQuery,
  AppSideBarQueryAverageBlockTimeQueryVariables,
  AppSideBarQueryCommunityStatus,
  AppSideBarQueryCommunityStatusQuery,
  AppSideBarQueryCommunityStatusQueryVariables,
} from "../../generated/graphql";
import { useGraphQLQuery } from "../../hooks/graphql";
import { useInterval } from "../../hooks/useInterval";
import {
  isRequestStateError,
  isRequestStateLoaded,
  mapRequestData,
  RequestState,
  RequestStateError,
  RequestStateInitial,
  RequestStateLoaded,
  RequestStateLoading,
} from "../../models/RequestState";
import { useQueryClient } from "../../providers/QueryClientProvider";
import Config from "../../config/Config";
import { convertMinimalTokenToToken } from "../../utils/coin";
import { ChainHealth, ChainStatus, CommunityStatus } from "./AppSideBarModel";

type AppSideBarRequestState = RequestState<ChainHealth>;

const coinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;

export function useChainHealthQuery(): {
  requestState: AppSideBarRequestState;
} {
  const [requestState, setRequestState] =
    useState<AppSideBarRequestState>(RequestStateInitial);

  const { stargateQuery } = useQueryClient();

  const averageBlockTimeRequestState = useGraphQLQuery<
    AppSideBarQueryAverageBlockTimeQuery,
    AppSideBarQueryAverageBlockTimeQueryVariables
  >(AppSideBarQueryAverageBlockTime, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-only",
  });

  const fetchChainHealth = useCallback(async () => {
    if (isRequestStateError(averageBlockTimeRequestState)) {
      setRequestState(RequestStateError(averageBlockTimeRequestState.error));
      return;
    }

    if (!isRequestStateLoaded(averageBlockTimeRequestState)) {
      setRequestState(RequestStateLoading);
      return;
    }

    const latestBlock = await stargateQuery.getBlock();
    if (latestBlock.header.height < 2) {
      setRequestState(
        RequestStateLoaded({
          chainStatus: ChainStatus.Online,
          latestHeight: latestBlock.header.height,
        })
      );
      return;
    }

    const previousBlock = await stargateQuery.getBlock(
      latestBlock.header.height - 1
    );

    const nowToLatestBlockDiff = differenceInSeconds(
      new Date(latestBlock.header.time),
      new Date()
    );
    const latestToPreviousBlockDiff = differenceInSeconds(
      new Date(previousBlock.header.time),
      new Date(latestBlock.header.time)
    );

    // If the chain doesn't produce blocks for more than 1 minute, it is considered as halted
    if (nowToLatestBlockDiff > 60) {
      setRequestState(
        RequestStateLoaded({
          chainStatus: ChainStatus.Halted,
          latestHeight: latestBlock.header.height,
        })
      );
      // If the chain produces blocks slower than 3 times the average block time, it is considered as congested
    } else if (
      latestToPreviousBlockDiff >
      3 * averageBlockTimeRequestState.data.averageBlockTime
    ) {
      setRequestState(
        RequestStateLoaded({
          chainStatus: ChainStatus.Congested,
          latestHeight: latestBlock.header.height,
        })
      );
    } else {
      setRequestState(
        RequestStateLoaded({
          chainStatus: ChainStatus.Online,
          latestHeight: latestBlock.header.height,
        })
      );
    }
  }, [stargateQuery, averageBlockTimeRequestState]);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  useInterval(fetchChainHealth, 3000);

  return {
    requestState,
  };
}

export function useAppSideBarCommunityStatusQuery(): RequestState<CommunityStatus> {
  const requestState = useGraphQLQuery<
    AppSideBarQueryCommunityStatusQuery,
    AppSideBarQueryCommunityStatusQueryVariables
  >(AppSideBarQueryCommunityStatus);

  return mapRequestData<AppSideBarQueryCommunityStatusQuery, CommunityStatus>(
    requestState,
    (r) => {
      const communityPool = r.communityStatus.communityPool.find(
        (c) => c.denom === coinMinimalDenom
      );
      return {
        inflation: new BigNumber(r.communityStatus.inflation),
        bondedRatio: new BigNumber(r.communityStatus.bondedRatio),
        communityPool: {
          denom: coinMinimalDenom,
          amount: convertMinimalTokenToToken(communityPool?.amount ?? 0),
        },
      };
    }
  );
}
