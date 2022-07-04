import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import cn from "classnames";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  isRequestStateError,
  isRequestStateLoaded,
} from "../../models/RequestState";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import { useLocale } from "../../providers/AppLocaleProvider";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import AppRoutes from "../../navigation/AppRoutes";
import ProposalHistory, {
  ProposalHistoryTabItem,
} from "../ProposalHistory/ProposalHistory";
import { ProposalHistoryFilterKey } from "../ProposalHistory/ProposalHistoryModel";
import Paper from "../common/Paper/Paper";
import {
  usePortfolioQuery,
  usePortfolioScreenProposalHistoryQuery,
} from "./PortfolioScreenAPI";
import PortfolioPanel from "./PortfolioPanel";

const PROPOSAL_HISTORY_PAGE_SIZE = 2;

const filterItems: ProposalHistoryTabItem[] = [
  {
    value: "voted",
    label: "ProposalHistory.filters.voted",
  },
  {
    value: "submitted",
    label: "ProposalHistory.filters.submitted",
  },
  {
    value: "deposited",
    label: "ProposalHistory.filters.deposited",
  },
];

const PortfolioScreen: React.FC = () => {
  const proposalHistoryQuery = usePortfolioScreenProposalHistoryQuery();
  const portfolioQuery = usePortfolioQuery();

  const wallet = useWallet();
  const { translate } = useLocale();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const address = useMemo(() => {
    if (wallet.status === ConnectionStatus.Connected) {
      return wallet.account.address;
    }
    return "";
  }, [wallet]);

  const [selectedTab, setSelectedTab] =
    useState<ProposalHistoryFilterKey>("voted");
  const [after, setAfter] = useState(0);

  const isYourPortfolio = useMemo(() => !address, [address]);

  const handleSelectTab = useCallback((tab: ProposalHistoryFilterKey) => {
    setSelectedTab(tab);
  }, []);

  const handlePageChange = useCallback((after: number) => {
    setAfter(after);
  }, []);

  useEffect(() => {
    if (wallet.status === ConnectionStatus.Idle && !address) {
      wallet.openConnectWalletModal();
    } else {
      if (isRequestStateError(portfolioQuery.requestState)) {
        if (portfolioQuery.requestState.error.message === "Invalid address") {
          navigate(AppRoutes.ErrorInvalidAddress);
        } else {
          toast.error(
            translate("PortfolioScreen.portfolioQuery.requestState.error")
          );
        }
      }
      if (isRequestStateError(proposalHistoryQuery.requestState)) {
        toast.error(
          translate("PortfolioScreen.proposalHistoryQuery.requestState.error")
        );
      }
    }
  }, [
    address,
    navigate,
    portfolioQuery.requestState,
    proposalHistoryQuery.requestState,
    translate,
    wallet,
  ]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    portfolioQuery.fetch(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, portfolioQuery.fetch]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    proposalHistoryQuery.fetch({
      first: PROPOSAL_HISTORY_PAGE_SIZE,
      after: after,
      tab: selectedTab,
      address,
    });
    setSearchParams({
      tab: selectedTab,
      page: (after / PROPOSAL_HISTORY_PAGE_SIZE + 1).toString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address,
    after,
    proposalHistoryQuery.fetch,
    selectedTab,
    setSearchParams,
  ]);

  useEffect(() => {
    const tab = filterItems.find(
      (item) => item.value === searchParams.get("tab")
    );
    if (tab) {
      setSelectedTab(tab.value);
    }
    const page = searchParams.get("page");
    if (page) {
      setAfter((parseInt(page, 10) - 1) * PROPOSAL_HISTORY_PAGE_SIZE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("flex", "flex-col")}>
      {isRequestStateLoaded(portfolioQuery.requestState) &&
      portfolioQuery.requestState.data ? (
        <PortfolioPanel
          portfolio={portfolioQuery.requestState.data}
          isYourPortfolio={isYourPortfolio}
        />
      ) : (
        <Paper className={cn("flex", "justify-center", "items-center")}>
          <LoadingSpinner />
        </Paper>
      )}
      {isRequestStateLoaded(proposalHistoryQuery.requestState) ? (
        <ProposalHistory
          data={proposalHistoryQuery.requestState.data}
          address={address}
          tabs={filterItems}
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
