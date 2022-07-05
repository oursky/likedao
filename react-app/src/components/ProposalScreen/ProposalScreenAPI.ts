import { useCallback, useMemo } from "react";
import {
  ProposalScreenQuery,
  ProposalScreenQueryQuery,
  ProposalScreenQueryQueryVariables,
  ProposalStatusFilter,
} from "../../generated/graphql";
import { useLazyGraphQLQuery } from "../../hooks/graphql";
import { mapRequestData, RequestState } from "../../models/RequestState";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { ReactionItem } from "../proposals/ProposalModel";
import { getReactionType } from "../reactions/ReactionModel";
import { PaginatedProposals } from "./ProposalScreenModel";

type ProposalFilter = Omit<
  ProposalScreenQueryQueryVariables,
  "first" | "after"
>;

export type FilterKey =
  | "all"
  | "voting"
  | "deposit"
  | "passed"
  | "rejected"
  | "following";

function getFilterVariables(tab: FilterKey, address?: string): ProposalFilter {
  if (tab === "following") {
    return {
      address: address
        ? {
            address,
            isVoter: true,
            isDepositor: true,
            isSubmitter: true,
          }
        : undefined,
    };
  }
  switch (tab) {
    case "all":
      return {};
    case "voting":
      return { status: ProposalStatusFilter.Voting };
    case "deposit":
      return { status: ProposalStatusFilter.Deposit };
    case "passed":
      return { status: ProposalStatusFilter.Passed };
    case "rejected":
      return { status: ProposalStatusFilter.Rejected };
    default:
      throw new Error(`Unknown filter state`);
  }
}

interface UseProposalsQuery {
  (initialOffset: number, pageSize: number): {
    requestState: RequestState<PaginatedProposals>;
    fetch: (variables: {
      first: number;
      after: number;
      tab: FilterKey;
    }) => void;
  };
}

export const useProposalsQuery: UseProposalsQuery = (
  initialOffset,
  pageSize
) => {
  const wallet = useWallet();

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
    ({
      first,
      after,
      tab,
    }: {
      first: number;
      after: number;
      tab: FilterKey;
    }) => {
      let address;
      if (wallet.status === ConnectionStatus.Connected) {
        address = wallet.account.address;
      }
      // Errors are handled by the requestState
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch({
        variables: {
          first,
          after,
          ...getFilterVariables(tab, address),
        },
      });
    },
    [fetch, wallet]
  );

  const data = useMemo(() => {
    return mapRequestData<ProposalScreenQueryQuery, PaginatedProposals>(
      requestState,
      (r) => ({
        proposals: r.proposals.edges.map((p) => ({
          ...p.node,
          reactions: p.node.reactions
            .map((r) => ({
              type: getReactionType(r.reaction),
              count: r.count,
            }))
            .filter((r): r is ReactionItem => r.type != null),
        })),
        totalCount: r.proposals.totalCount,
      })
    );
  }, [requestState]);

  return {
    requestState: data,
    fetch: callFetch,
  };
};
