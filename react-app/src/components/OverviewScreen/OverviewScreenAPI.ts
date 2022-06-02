import BigNumber from "bignumber.js";
import Config from "../../config/Config";
import {
  OverviewScreenQuery,
  OverviewScreenQueryQuery,
  OverviewScreenQueryQueryVariables,
} from "../../generated/graphql";
import { useGraphQLQuery } from "../../hooks/graphql";
import { mapRequestData, RequestState } from "../../models/RequestState";
import { convertMinimalTokenToToken } from "../../utils/coin";
import { CommunityStatus } from "./OverviewScreenModel";

const coinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;
export function useCommunityStatusQuery(): RequestState<CommunityStatus> {
  const requestState = useGraphQLQuery<
    OverviewScreenQueryQuery,
    OverviewScreenQueryQueryVariables
  >(OverviewScreenQuery);

  return mapRequestData<OverviewScreenQueryQuery, CommunityStatus>(
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
