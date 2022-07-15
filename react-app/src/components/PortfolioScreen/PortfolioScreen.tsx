import React, { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import cn from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import {
  isRequestStateError,
  isRequestStateLoaded,
} from "../../models/RequestState";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import { useLocale } from "../../providers/AppLocaleProvider";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import AppRoutes from "../../navigation/AppRoutes";
import Paper from "../common/Paper/Paper";
import ProposalHistory, {
  PROPOSAL_HISTORY_PAGE_SIZE,
} from "../ProposalHistory/ProposalHistory";
import { useProposalHistory } from "../ProposalHistory/ProposalHistoryAPI";
import { usePortfolioQuery, useStakesQuery } from "./PortfolioScreenAPI";
import PortfolioPanel from "./PortfolioPanel";
import StakesPanel from "./StakesPanel";

const PortfolioScreen: React.FC = () => {
  const { address: addressFromUrl } = useParams();
  const navigate = useNavigate();

  const { requestState: portfolioRequestState, fetch: fetchPortfolio } =
    usePortfolioQuery();

  const {
    requestState: stakesRequestState,
    fetch: fetchStakes,
    order: stakesOrder,
    setOrder: setStakesOrder,
  } = useStakesQuery();

  const {
    selectedTab,
    after,
    handlePageChange,
    handleSelectTab,
    requestState: proposalHistoryRequestState,
    fetch: fetchProposalHistory,
  } = useProposalHistory();

  const { translate } = useLocale();
  const wallet = useWallet();

  const address = useMemo((): string | null => {
    if (addressFromUrl) {
      return addressFromUrl;
    }
    if (wallet.status === ConnectionStatus.Connected) {
      return wallet.account.address;
    }
    return null;
  }, [addressFromUrl, wallet]);

  const isYourPortfolio = useMemo(() => !addressFromUrl, [addressFromUrl]);

  useEffect(() => {
    if (wallet.status === ConnectionStatus.Idle && !address) {
      wallet.openConnectWalletModal();
    } else {
      if (isRequestStateError(portfolioRequestState)) {
        if (portfolioRequestState.error.message === "Invalid address") {
          navigate(AppRoutes.ErrorInvalidAddress);
        } else {
          toast.error(
            translate("PortfolioScreen.portfolio.requestState.error")
          );
        }
      }
      if (isRequestStateError(proposalHistoryRequestState)) {
        toast.error(
          translate("PortfolioScreen.proposalHistory.requestState.error")
        );
      }
    }
  }, [
    address,
    navigate,
    portfolioRequestState,
    proposalHistoryRequestState,
    translate,
    wallet,
  ]);

  useEffect(() => {
    if (address) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchPortfolio(address);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchStakes(address);
    }
  }, [address, fetchPortfolio, fetchStakes]);

  useEffect(() => {
    if (address) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchProposalHistory({
        first: PROPOSAL_HISTORY_PAGE_SIZE,
        after: after,
        tab: selectedTab,
        address,
      });
    }
  }, [fetchProposalHistory, after, selectedTab, address]);

  return (
    <div className={cn("flex", "flex-col")}>
      {isRequestStateLoaded(portfolioRequestState) ? (
        <PortfolioPanel
          portfolio={portfolioRequestState.data}
          isYourPortfolio={isYourPortfolio}
        />
      ) : (
        <Paper className={cn("flex", "justify-center", "items-center")}>
          <LoadingSpinner />
        </Paper>
      )}

      <StakesPanel
        isLoading={!isRequestStateLoaded(stakesRequestState)}
        stakes={
          isRequestStateLoaded(stakesRequestState)
            ? stakesRequestState.data
            : null
        }
        isYourPortfolio={isYourPortfolio}
        order={stakesOrder}
        setOrder={setStakesOrder}
      />

      {isRequestStateLoaded(proposalHistoryRequestState) &&
      isRequestStateLoaded(portfolioRequestState) &&
      isRequestStateLoaded(stakesRequestState) ? (
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

export default PortfolioScreen;
