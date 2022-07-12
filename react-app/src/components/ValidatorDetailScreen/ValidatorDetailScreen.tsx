import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import cn from "classnames";
import Config from "../../config/Config";
import { isRequestStateLoaded } from "../../models/RequestState";
import { translateAddress } from "../../utils/address";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import Paper from "../common/Paper/Paper";
import ProposalHistory, {
  PROPOSAL_HISTORY_PAGE_SIZE,
} from "../ProposalHistory/ProposalHistory";
import { useProposalHistory } from "../ProposalHistory/ProposalHistoryAPI";

const Bech32PrefixAccAddr = Config.chainInfo.bech32Config.bech32PrefixAccAddr;

const ValidatorDetailScreen: React.FC = () => {
  const { address: operatorAddress } = useParams();

  const selfDelegateAddress = useMemo(
    // eslint-disable-next-line no-confusing-arrow
    () =>
      operatorAddress
        ? translateAddress(operatorAddress, Bech32PrefixAccAddr)
        : null,
    [operatorAddress]
  );

  const {
    selectedTab,
    after,
    handlePageChange,
    handleSelectTab,
    requestState: proposalHistoryRequestState,
    fetch: fetchProposalHistory,
  } = useProposalHistory();

  useEffect(() => {
    if (selfDelegateAddress) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchProposalHistory({
        first: PROPOSAL_HISTORY_PAGE_SIZE,
        after: after,
        tab: selectedTab,
        address: selfDelegateAddress,
      });
    }
  }, [fetchProposalHistory, after, selectedTab, selfDelegateAddress]);

  return (
    <div>
      {isRequestStateLoaded(proposalHistoryRequestState) ? (
        <ProposalHistory
          data={proposalHistoryRequestState.data}
          selectedTab={selectedTab}
          onSelectTab={handleSelectTab}
          pageSize={PROPOSAL_HISTORY_PAGE_SIZE}
          currentOffset={after}
          onPageChange={handlePageChange}
        />
      ) : (
        <Paper className={cn("flex", "justify-center", "items-center")}>
          <LoadingSpinner />
        </Paper>
      )}
    </div>
  );
};

export default ValidatorDetailScreen;
