import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistance, isAfter } from "date-fns";
import {
  ProposalDetailScreenQuery,
  ProposalDetailScreenQueryQuery,
  ProposalDetailScreenQueryQueryVariables,
  ProposalVoteSort,
  ProposalDetailVotesPanelQuery,
  ProposalDetailVotesPanelQueryQuery,
  ProposalDetailVotesPanelQueryQueryVariables,
  ProposalDetailDepositsPanelQuery,
  ProposalDetailDepositsPanelQueryQuery,
  ProposalDetailDepositsPanelQueryQueryVariables,
  ProposalDepositSort,
  Sort,
} from "../../generated/graphql";
import { useGraphQLQuery, useLazyGraphQLQuery } from "../../hooks/graphql";
import {
  mapRequestData,
  RequestState,
  RequestStateError,
  RequestStateInitial,
  RequestStateLoaded,
  RequestStateLoading,
} from "../../models/RequestState";
import { convertMinimalTokenToToken } from "../../utils/coin";
import { getReactionType } from "../reactions/ReactionModel";
import { useQueryClient } from "../../providers/QueryClientProvider";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import Config from "../../config/Config";
import { useLocale } from "../../providers/AppLocaleProvider";
import { GovParams } from "../../models/cosmos/gov";
import { useGovAPI } from "../../api/govAPI";
import {
  PaginatedProposalVotes,
  PaginatedProposalDeposits,
  Proposal,
  ReactionItem,
  ProposalVote,
  ProposalDeposit,
  ProposalDepositDepositor,
  ProposalVoteVoter,
} from "./ProposalDetailScreenModel";

const getVoterOrDepositorAddress = (
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  voterOrDepositor: ProposalVoteVoter | ProposalDepositDepositor
): string | null => {
  if (voterOrDepositor.__typename === "StringObject") {
    return voterOrDepositor.value;
  }

  if (voterOrDepositor.__typename === "Validator") {
    return voterOrDepositor.operatorAddress ?? null;
  }

  return null;
};

const CoinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;
const CoinDenom = Config.chainInfo.currency.coinDenom;

export enum ProposalVoteSortableColumn {
  Voter = "voter",
  Option = "option",
}

function getProposalVoteSortOrderVariable(
  order: {
    id: ProposalVoteSortableColumn;
    direction: "asc" | "desc";
  } | null
): ProposalVoteSort {
  if (!order) {
    return {};
  }
  switch (order.id) {
    case ProposalVoteSortableColumn.Voter:
      return {
        voter: order.direction === "asc" ? Sort.Asc : Sort.Desc,
      };
    case ProposalVoteSortableColumn.Option:
      return {
        option: order.direction === "asc" ? Sort.Asc : Sort.Desc,
      };
    default:
      return {};
  }
}

interface UseProposalVotesQuery {
  (proposalId: string, initialOffset: number, pageSize: number): {
    requestState: RequestState<PaginatedProposalVotes>;
    fetch: (variables: {
      first: number;
      after: number;
      order: {
        id: ProposalVoteSortableColumn;
        direction: "asc" | "desc";
      } | null;
    }) => Promise<void>;
  };
}

export const useProposalVotesQuery: UseProposalVotesQuery = (
  proposalId,
  initialOffset,
  pageSize
) => {
  const wallet = useWallet();
  const { query } = useQueryClient();

  const [delegatedValidators, setDelegatedValidators] = useState<string[]>([]);

  const [fetch, { requestState }] = useLazyGraphQLQuery<
    ProposalDetailVotesPanelQueryQuery,
    ProposalDetailVotesPanelQueryQueryVariables
  >(ProposalDetailVotesPanelQuery, {
    variables: {
      proposalId,
      input: {
        after: initialOffset,
        first: pageSize,
        order: {},
      },
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const callFetch = useCallback(
    async ({
      first,
      after,
      order,
    }: {
      first: number;
      after: number;
      order: {
        id: ProposalVoteSortableColumn;
        direction: "asc" | "desc";
      } | null;
    }) => {
      let delegatedValidators: string[] = [];

      if (wallet.status === ConnectionStatus.Connected) {
        try {
          const delegations = await query.staking.delegatorDelegations(
            wallet.account.address
          );

          delegatedValidators = delegations.delegationResponses
            .filter((r) => r.delegation != null)
            .map((r) => r.delegation!.validatorAddress);

          setDelegatedValidators(delegatedValidators);
        } catch (err: unknown) {
          console.error("Failed to get user delegations = ", err);
        }
      }
      await fetch({
        variables: {
          proposalId,
          input: {
            first,
            after,
            pinnedValidators: delegatedValidators,
            order: getProposalVoteSortOrderVariable(order),
          },
        },
      });
    },
    [fetch, proposalId, wallet, query]
  );

  const data = useMemo(() => {
    return mapRequestData<
      ProposalDetailVotesPanelQueryQuery,
      PaginatedProposalVotes
    >(requestState, (r) => {
      const allVotes = r.proposalByID?.votes.edges.map((v) => v.node) ?? [];
      const [pinnedVotes, votes] = allVotes.reduce<
        [ProposalVote[], ProposalVote[]]
      >(
        (acc, curr) => {
          const address = getVoterOrDepositorAddress(curr.voter);
          if (!address) return acc;

          acc[delegatedValidators.includes(address) ? 0 : 1].push(curr);
          return acc;
        },
        [[], []]
      );

      return {
        pinnedVotes,
        votes,
        totalCount: r.proposalByID?.votes.totalCount ?? 0,
      };
    });
  }, [requestState, delegatedValidators]);

  return {
    requestState: data,
    fetch: callFetch,
  };
};

export enum ProposalDepositSortableColumn {
  Depositor = "depositor",
  Amount = "amount",
}

function getProposalDepositSortOrderVariable(
  order: {
    id: ProposalDepositSortableColumn;
    direction: "asc" | "desc";
  } | null
): ProposalDepositSort {
  if (!order) {
    return {};
  }
  switch (order.id) {
    case ProposalDepositSortableColumn.Depositor:
      return {
        depositor: order.direction === "asc" ? Sort.Asc : Sort.Desc,
      };
    case ProposalDepositSortableColumn.Amount:
      return {
        amount: order.direction === "asc" ? Sort.Asc : Sort.Desc,
      };
    default:
      return {};
  }
}

interface UseProposalDepositsQuery {
  (proposalId: string, initialOffset: number, pageSize: number): {
    requestState: RequestState<PaginatedProposalDeposits>;
    fetch: (variables: {
      first: number;
      after: number;
      order: {
        id: ProposalDepositSortableColumn;
        direction: "asc" | "desc";
      } | null;
    }) => Promise<void>;
  };
}

export const useProposalDepositsQuery: UseProposalDepositsQuery = (
  proposalId,
  initialOffset,
  pageSize
) => {
  const wallet = useWallet();
  const { query } = useQueryClient();

  const [delegatedValidators, setDelegatedValidators] = useState<string[]>([]);
  const [fetch, { requestState }] = useLazyGraphQLQuery<
    ProposalDetailDepositsPanelQueryQuery,
    ProposalDetailDepositsPanelQueryQueryVariables
  >(ProposalDetailDepositsPanelQuery, {
    variables: {
      proposalId,
      input: {
        after: initialOffset,
        first: pageSize,
        order: {},
      },
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const callFetch = useCallback(
    async ({
      first,
      after,
      order,
    }: {
      first: number;
      after: number;
      order: {
        id: ProposalDepositSortableColumn;
        direction: "asc" | "desc";
      } | null;
    }) => {
      let delegatedValidators: string[] = [];

      if (wallet.status === ConnectionStatus.Connected) {
        try {
          const delegations = await query.staking.delegatorDelegations(
            wallet.account.address
          );

          delegatedValidators = delegations.delegationResponses
            .filter((r) => r.delegation != null)
            .map((r) => r.delegation!.validatorAddress);

          setDelegatedValidators(delegatedValidators);
        } catch (err: unknown) {
          console.error("Failed to get user delegations = ", err);
        }
      }

      await fetch({
        variables: {
          proposalId,
          input: {
            first,
            after,
            order: getProposalDepositSortOrderVariable(order),
            pinnedValidators: delegatedValidators,
          },
        },
      });
    },
    [fetch, proposalId, wallet, query]
  );

  const data = useMemo(() => {
    return mapRequestData<
      ProposalDetailDepositsPanelQueryQuery,
      PaginatedProposalDeposits
    >(requestState, (r) => {
      const allDeposits =
        r.proposalByID?.deposits.edges.map((v) => {
          const deposit = v.node.amount.find(
            (c) => c.denom === CoinMinimalDenom
          );

          return {
            ...v.node,
            amount: {
              denom: CoinDenom,
              amount: convertMinimalTokenToToken(deposit?.amount ?? 0),
            },
          };
        }) ?? [];

      const [pinnedDeposits, deposits] = allDeposits.reduce<
        [ProposalDeposit[], ProposalDeposit[]]
      >(
        (acc, curr) => {
          const address =
            curr.depositor != null
              ? getVoterOrDepositorAddress(curr.depositor)
              : null;

          acc[address && delegatedValidators.includes(address) ? 0 : 1].push(
            curr
          );
          return acc;
        },
        [[], []]
      );

      return {
        pinnedDeposits,
        deposits,
        totalCount: r.proposalByID?.deposits.totalCount ?? 0,
      };
    });
  }, [requestState, delegatedValidators]);

  return {
    requestState: data,
    fetch: callFetch,
  };
};

export function useProposalQuery(id: number | null): {
  requestState: RequestState<Proposal | null>;
} {
  const { dateFnsLocale } = useLocale();

  const requestState = useGraphQLQuery<
    ProposalDetailScreenQueryQuery,
    ProposalDetailScreenQueryQueryVariables
  >(ProposalDetailScreenQuery, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    skip: id == null,
    variables: {
      id: `proposal_${id}`,
    },
  });

  const data = useMemo(() => {
    return mapRequestData<ProposalDetailScreenQueryQuery, Proposal | null>(
      requestState,
      // eslint-disable-next-line complexity
      (r) => {
        if (!r.proposalByID) {
          return null;
        }
        const now = new Date();
        const proposal = r.proposalByID;
        const votingStartTime = proposal.votingStartTime
          ? new Date(proposal.votingStartTime)
          : null;
        const votingEndTime = proposal.votingEndTime
          ? new Date(proposal.votingEndTime)
          : null;
        const depositEndTime = proposal.depositEndTime
          ? new Date(proposal.depositEndTime)
          : null;
        const submitTime = new Date(proposal.submitTime);

        return {
          ...proposal,

          votingStartTime: votingStartTime,
          votingEndTime: votingEndTime,
          depositEndTime: depositEndTime,
          submitTime: submitTime,
          turnout: proposal.turnout ?? null,
          remainingVotingDuration:
            votingStartTime && votingEndTime && isAfter(votingEndTime, now)
              ? formatDistance(votingEndTime, now, {
                  locale: dateFnsLocale,
                })
              : null,
          remainingDepositDuration:
            depositEndTime && isAfter(depositEndTime, now)
              ? formatDistance(depositEndTime, now, {
                  locale: dateFnsLocale,
                })
              : null,

          depositTotal: convertMinimalTokenToToken(
            proposal.depositTotal.find((t) => t.denom === CoinMinimalDenom)
              ?.amount ?? 0
          ),
          tallyResult: proposal.tallyResult && {
            yes: convertMinimalTokenToToken(proposal.tallyResult.yes),
            no: convertMinimalTokenToToken(proposal.tallyResult.no),
            noWithVeto: convertMinimalTokenToToken(
              proposal.tallyResult.noWithVeto
            ),
            abstain: convertMinimalTokenToToken(proposal.tallyResult.abstain),
          },
          reactions: proposal.reactions
            .map((r) => ({
              type: getReactionType(r.reaction),
              count: r.count,
            }))
            .filter((r): r is ReactionItem => r.type != null),
        };
      }
    );
  }, [dateFnsLocale, requestState]);

  return {
    requestState: data,
  };
}

export function useGovParamsQuery(): {
  requestState: RequestState<GovParams | null>;
} {
  const govAPI = useGovAPI();
  const [requestState, setRequestState] =
    useState<RequestState<GovParams>>(RequestStateInitial);

  const fetch = useCallback(async () => {
    setRequestState(RequestStateLoading);
    try {
      const params = await govAPI.getAllParams();
      setRequestState(RequestStateLoaded(params));
    } catch (err: unknown) {
      console.error("Failed to get gov params = ", err);
      if (err instanceof Error) {
        setRequestState(RequestStateError(err));
      } else {
        setRequestState(RequestStateError(new Error("Unknown error")));
      }
    }
  }, [govAPI]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetch();
  }, [fetch]);

  return {
    requestState,
  };
}
