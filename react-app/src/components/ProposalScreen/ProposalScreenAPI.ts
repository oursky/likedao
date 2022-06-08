import { useCallback, useMemo, useState } from "react";
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
  currentFilter: FilterKey;
  fetch: (after?: number) => void;
  applySearch: (searchTerm: string | null) => void;
  applyFilter: (filter: FilterKey, address: string | null) => void;
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

  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("voting");

  const callFetch = useCallback(
    (after?: number) => {
      // Errors are handled by the requestState
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch({
        variables: {
          after: after ?? initialOffset,
          first: pageSize,
          searchTerm,
          ...getFilterVariables(filter, address),
        },
      });
    },
    [address, fetch, filter, initialOffset, pageSize, searchTerm]
  );

  const applySearch = useCallback(
    (searchTerm: string | null) => {
      setSearchTerm(searchTerm);
      callFetch();
    },
    [callFetch]
  );

  const applyFilter = useCallback(
    (filter: FilterKey, address: string | null) => {
      if (address != null) {
        setAddress(address);
        setFilter("following");
      } else {
        setFilter(filter);
      }
      callFetch();
    },
    [callFetch]
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
    currentFilter: filter,
    fetch: callFetch,
    applySearch,
    applyFilter,
  };
}
