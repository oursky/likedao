import { useCallback, useMemo } from "react";
import {
  ProposalScreenQuery,
  ProposalScreenQueryQuery,
  ProposalScreenQueryQueryVariables,
  ProposalFilter,
} from "../../generated/graphql";
import { useLazyGraphQLQuery } from "../../hooks/graphql";
import { mapRequestData, RequestState } from "../../models/RequestState";
import { PaginatedProposals } from "./ProposalScreenModel";

export type FilterKey =
  | "voting"
  | "deposit"
  | "passed"
  | "rejected"
  | "following";

function getFilterVariables(
  filter: FilterKey,
  address: string | null
): {
  filter?: ProposalFilter;
  followingAddress?: string;
} {
  if (filter === "following") {
    return {
      followingAddress: address ?? undefined,
    };
  }
  switch (filter) {
    case "voting":
      return { filter: ProposalFilter.Voting };
    case "deposit":
      return { filter: ProposalFilter.Deposit };
    case "passed":
      return { filter: ProposalFilter.Passed };
    case "rejected":
      return { filter: ProposalFilter.Rejected };
    default:
      throw new Error(`Unknown filter state`);
  }
}

export function useProposalsQuery(
  initialOffset: number,
  pageSize: number
): {
  requestState: RequestState<PaginatedProposals>;
  fetch: (
    offset: number,
    filter: FilterKey,
    address?: string,
    searchTerm?: string
  ) => void;
} {
  const [fetch, { requestState }] = useLazyGraphQLQuery<
    ProposalScreenQueryQuery,
    ProposalScreenQueryQueryVariables
  >(ProposalScreenQuery, {
    variables: {
      after: initialOffset,
      first: pageSize,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const callFetch = useCallback(
    (
      offset: number,
      filter: FilterKey = "voting",
      address?: string,
      searchTerm?: string
    ) => {
      // Errors are handled by the requestState
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch({
        variables: {
          after: offset,
          first: pageSize,
          searchTerm,
          ...getFilterVariables(filter, address ?? null),
        },
      });
    },
    [fetch, pageSize]
  );

  const data = useMemo(() => {
    return mapRequestData<ProposalScreenQueryQuery, PaginatedProposals>(
      requestState,
      (r) => ({
        proposals: r.proposals.edges.map((p) => p.node),
        totalCount: r.proposals.totalCount,
      })
    );
  }, [requestState]);

  return {
    requestState: data,
    fetch: callFetch,
  };
}
