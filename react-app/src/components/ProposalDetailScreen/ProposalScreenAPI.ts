import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { differenceInDays } from "date-fns";
import {
  ProposalDetailScreenQuery,
  ProposalDetailScreenQueryQuery,
  ProposalDetailScreenQueryQueryVariables,
} from "../../generated/graphql";
import { useLazyGraphQLQuery } from "../../hooks/graphql";
import { mapRequestData, RequestState } from "../../models/RequestState";
import { convertMinimalTokenToToken } from "../../utils/coin";
import { Proposal } from "./ProposalDetailScreenModel";

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

export function useProposalQuery(): {
  requestState: RequestState<Proposal | null>;
  fetch: (id: string) => void;
} {
  const [fetch, { requestState }] = useLazyGraphQLQuery<
    ProposalDetailScreenQueryQuery,
    ProposalDetailScreenQueryQueryVariables
  >(ProposalDetailScreenQuery, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const callFetch = useCallback(
    (id: string) => {
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
          votingStartTime: proposal.votingEndTime
            ? new Date(proposal.votingEndTime)
            : null,
          depositEndTime: proposal.depositEndTime
            ? new Date(proposal.depositEndTime)
            : null,
          submitTime: new Date(proposal.submitTime),
          turnout: calculateTurnout(proposal.tallyResult),
          remainingVotingDays:
            proposal.votingStartTime &&
            proposal.votingEndTime &&
            differenceInDays(Date.now(), new Date(proposal.votingEndTime)),
          depositTotal: convertMinimalTokenToToken(proposal.depositTotal),
        };
      }
    );
  }, [requestState]);

  return {
    requestState: data,
    fetch: callFetch,
  };
}
