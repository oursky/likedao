import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useLazyGraphQLQuery } from "../../hooks/graphql";
import { mapRequestData, RequestState } from "../../models/RequestState";
import {
  ProposalHistoryQuery as ProposalHistoryGraphqlQuery,
  ProposalHistoryQueryQuery,
  ProposalHistoryQueryQueryVariables,
  Sort,
} from "../../generated/graphql";
import {
  ProposalHistory,
  ProposalHistoryFilterKey,
} from "./ProposalHistoryModel";

interface ProposalHistoryFilterControls {
  after: number;
  selectedTab: ProposalHistoryFilterKey;
  handlePageChange: (after: number) => void;
  handleSelectTab: (tab: ProposalHistoryFilterKey) => void;
}

interface ProposalHistoryQuery {
  requestState: RequestState<ProposalHistory>;
  fetch: ({
    first,
    after,
    tab,
    address,
  }: {
    first: number;
    after: number;
    tab: ProposalHistoryFilterKey;
    address: string;
  }) => void;
}

interface ProposalHistoryFilter {
  address: string;
  isVoter: boolean;
  isSubmitter: boolean;
  isDepositor: boolean;
}

const PROPOSAL_HISTORY_PAGE_SIZE = 2;

function getFilterVariables(
  tab: ProposalHistoryFilterKey,
  address: string
): ProposalHistoryFilter {
  return {
    address: address,
    isVoter: tab === "voted",
    isSubmitter: tab === "submitted",
    isDepositor: tab === "deposited",
  };
}

const useProposalHistoryFilterControls = (): ProposalHistoryFilterControls => {
  const [searchParams, setSearchParams] = useSearchParams({
    tab: "voted",
    page: "1",
  });

  const after = useMemo(() => {
    return (
      (parseInt(searchParams.get("page") ?? "1", 10) - 1) *
      PROPOSAL_HISTORY_PAGE_SIZE
    );
  }, [searchParams]);

  const selectedTab = useMemo(
    () => (searchParams.get("tab") ?? "voted") as ProposalHistoryFilterKey,
    [searchParams]
  );

  const handleSelectTab = useCallback(
    (tab: ProposalHistoryFilterKey) => {
      setSearchParams({
        tab: tab,
        page: "1",
      });
    },
    [setSearchParams]
  );

  const handlePageChange = useCallback(
    (after: number) => {
      setSearchParams({
        tab: selectedTab,
        page: (after / PROPOSAL_HISTORY_PAGE_SIZE + 1).toString(),
      });
    },
    [selectedTab, setSearchParams]
  );

  return { after, selectedTab, handlePageChange, handleSelectTab };
};

const useProposalHistoryQuery = (): ProposalHistoryQuery => {
  const [fetch, { requestState }] = useLazyGraphQLQuery<
    ProposalHistoryQueryQuery,
    ProposalHistoryQueryQueryVariables
  >(ProposalHistoryGraphqlQuery, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const callFetch = useCallback(
    ({
      first,
      after,
      tab,
      address,
    }: {
      first: number;
      after: number;
      tab: ProposalHistoryFilterKey;
      address: string;
    }) => {
      // Errors are handled by the requestState
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch({
        variables: {
          first,
          after,
          order: {
            submitTime: Sort.Asc,
          },
          ...getFilterVariables(tab, address),
        },
      });
    },
    [fetch]
  );

  const data = mapRequestData<ProposalHistoryQueryQuery, ProposalHistory>(
    requestState,
    (d) => {
      return {
        proposalVotesDistribution: d.proposalVotesDistribution,
        proposals: d.proposals.edges.map((p) => p.node),
        totalProposalCount: d.proposals.totalCount,
      };
    }
  );

  return {
    requestState: data,
    fetch: callFetch,
  };
};

export const useProposalHistory = (): ProposalHistoryQuery &
  ProposalHistoryFilterControls => {
  const query = useProposalHistoryQuery();
  const controls = useProposalHistoryFilterControls();

  return {
    ...query,
    ...controls,
  };
};
