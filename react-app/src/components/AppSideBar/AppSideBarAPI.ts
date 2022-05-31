import {
  AppSideBarQueryChainHealth,
  AppSideBarQueryChainHealthQuery,
  AppSideBarQueryChainHealthQueryVariables,
  ChainHealth,
} from "../../generated/graphql";
import { useGraphQLQuery } from "../../hooks/graphql";
import { mapRequestData, RequestState } from "../../models/RequestState";

export function useChainHealthQuery(): RequestState<ChainHealth> {
  const requestState = useGraphQLQuery<
    AppSideBarQueryChainHealthQuery,
    AppSideBarQueryChainHealthQueryVariables
  >(AppSideBarQueryChainHealth, {
    // Half average block time
    pollInterval: 3000,
  });

  return mapRequestData<AppSideBarQueryChainHealthQuery, ChainHealth>(
    requestState,
    (r) => r.chainHealth
  );
}
