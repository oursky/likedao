import BigNumber from "bignumber.js";
import Config from "../../config/Config";
import {
  OverviewScreenQuery,
  OverviewScreenQueryQuery,
  OverviewScreenQueryQueryVariables,
  Sort,
} from "../../generated/graphql";
import { useGraphQLQuery } from "../../hooks/graphql";
import { mapRequestData, RequestState } from "../../models/RequestState";
import { convertMinimalTokenToToken } from "../../utils/coin";
import { ReactionItem } from "../proposals/ProposalModel";
import { getReactionType } from "../reactions/ReactionModel";
import { OverviewScreenModel } from "./OverviewScreenModel";

const coinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;

export function useCommunityStatusQuery(): RequestState<OverviewScreenModel> {
  const requestState = useGraphQLQuery<
    OverviewScreenQueryQuery,
    OverviewScreenQueryQueryVariables
  >(OverviewScreenQuery, {
    variables: {
      first: 4,
      after: 0,
      order: {
        submitTime: Sort.Desc,
      },
    },
  });

  return mapRequestData<OverviewScreenQueryQuery, OverviewScreenModel>(
    requestState,
    (r) => {
      const communityPool = r.communityStatus.communityPool.find(
        (c) => c.denom === coinMinimalDenom
      );

      return {
        communityStatus: {
          inflation: new BigNumber(r.communityStatus.inflation),
          bondedRatio: new BigNumber(r.communityStatus.bondedRatio),
          communityPool: {
            denom: coinMinimalDenom,
            amount: convertMinimalTokenToToken(communityPool?.amount ?? 0),
          },
        },
        proposals: r.proposals.edges.map((edge) => ({
          ...edge.node,
          reactions: edge.node.reactions
            .map((r) => ({
              type: getReactionType(r.reaction),
              count: r.count,
            }))
            .filter((r): r is ReactionItem => r.type != null),
        })),
      };
    }
  );
}
