import { useCallback, useMemo } from "react";
import {
  ProposalDetailScreenQuery,
  ProposalDetailScreenQueryQuery,
  ProposalDetailScreenQueryQueryVariables,
  ProposalDetailScreenProposalFragment as Proposal,
} from "../../generated/graphql";
import { useLazyGraphQLQuery } from "../../hooks/graphql";
import { mapRequestData, RequestState } from "../../models/RequestState";

export function useProposalQuery(id: string): {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  requestState: RequestState<Proposal | null>;
  fetch: (id: string) => void;
} {
  const [fetch, { requestState }] = useLazyGraphQLQuery<
    ProposalDetailScreenQueryQuery,
    ProposalDetailScreenQueryQueryVariables
  >(ProposalDetailScreenQuery, {
    variables: {
      id,
    },
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
    return mapRequestData<
      ProposalDetailScreenQueryQuery,
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
      Proposal | null
    >(requestState, (r) => {
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
      };
    });
  }, [requestState]);

  return {
    requestState: data,
    fetch: callFetch,
  };
}
