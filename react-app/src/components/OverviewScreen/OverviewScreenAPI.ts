import {
  OverviewScreenQuery,
  OverviewScreenQueryQuery,
  OverviewScreenQueryQueryVariables,
  CommunityStatus,
} from "../../generated/graphql";
import { useGraphQLQuery } from "../../hooks/graphql";
import { mapRequestData, RequestState } from "../../models/RequestState";

export function useCommunityStatusQuery(): RequestState<CommunityStatus> {
  const requestState = useGraphQLQuery<
    OverviewScreenQueryQuery,
    OverviewScreenQueryQueryVariables
  >(OverviewScreenQuery);

  return mapRequestData<OverviewScreenQueryQuery, CommunityStatus>(
    requestState,
    (r) => r.communityStatus
  );
}
