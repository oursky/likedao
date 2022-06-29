import { useCallback, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { differenceInDays } from "date-fns";
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
} from "../../generated/graphql";
import { useLazyGraphQLQuery } from "../../hooks/graphql";
import { mapRequestData, RequestState } from "../../models/RequestState";
import { convertMinimalTokenToToken } from "../../utils/coin";
import { getReactionType } from "../reactions/ReactionModel";
import { useQueryClient } from "../../providers/QueryClientProvider";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
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

const calculateTurnout = (tallyResult: Proposal["tallyResult"]) => {
  if (!tallyResult) {
    return 0;
  }

  const { yes, no, noWithVeto, abstain } = tallyResult;
  const total = BigNumber.sum(yes, no, noWithVeto, abstain);
  const turnout = new BigNumber(100).minus(
    abstain.dividedBy(total).multipliedBy(100)
  );

  return turnout.toNumber();
};

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

interface UseProposalVotesQuery {
  (proposalId: string, initialOffset: number, pageSize: number): {
    requestState: RequestState<PaginatedProposalVotes>;
    fetch: (variables: {
      first: number;
      after: number;
      order: ProposalVoteSort;
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
      order: ProposalVoteSort;
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
            order,
            pinnedValidators: delegatedValidators,
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

interface UseProposalDepositsQuery {
  (proposalId: string, initialOffset: number, pageSize: number): {
    requestState: RequestState<PaginatedProposalDeposits>;
    fetch: (variables: {
      first: number;
      after: number;
      order: ProposalDepositSort;
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
      order: ProposalDepositSort;
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
            order,
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
        r.proposalByID?.deposits.edges.map((v) => v.node) ?? [];
      const [pinnedDeposits, deposits] = allDeposits.reduce<
        [ProposalDeposit[], ProposalDeposit[]]
      >(
        (acc, curr) => {
          const address =
            curr.depositor != null
              ? getVoterOrDepositorAddress(curr.depositor)
              : null;
          if (!address) return acc;

          acc[delegatedValidators.includes(address) ? 0 : 1].push(curr);
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

export function useProposalQuery(): {
  requestState: RequestState<Proposal | null>;
  fetch: (id: number) => void;
} {
  const [fetch, { requestState }] = useLazyGraphQLQuery<
    ProposalDetailScreenQueryQuery,
    ProposalDetailScreenQueryQueryVariables
  >(ProposalDetailScreenQuery, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const callFetch = useCallback(
    (id: number) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch({
        variables: {
          id: `proposal_${id}`,
        },
      });
    },
    [fetch]
  );

  const data = useMemo(() => {
    return mapRequestData<ProposalDetailScreenQueryQuery, Proposal | null>(
      requestState,
      (r) => {
        if (!r.proposalByID) {
          return null;
        }
        const proposal = r.proposalByID;
        return {
          ...proposal,
          votingEndTime: proposal.votingEndTime
            ? new Date(proposal.votingEndTime)
            : null,
          votingStartTime: proposal.votingStartTime
            ? new Date(proposal.votingStartTime)
            : null,
          depositEndTime: proposal.depositEndTime
            ? new Date(proposal.depositEndTime)
            : null,
          submitTime: new Date(proposal.submitTime),
          turnout: calculateTurnout(proposal.tallyResult), // TODO: fetch from grahpql api instead
          remainingVotingDays:
            proposal.votingStartTime &&
            proposal.votingEndTime &&
            differenceInDays(new Date(proposal.votingEndTime), Date.now()),
          depositTotal: convertMinimalTokenToToken(proposal.depositTotal),
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
  }, [requestState]);

  return {
    requestState: data,
    fetch: callFetch,
  };
}
