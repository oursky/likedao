import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import cn from "classnames";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffectOnce } from "../../hooks/useEffectOnce";
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
import { usePortfolioScreenQuery } from "./PortfolioScreenAPI";
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
  const { requestState, fetch } = usePortfolioScreenQuery();

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

  useEffectOnce(
    () => {
      if (wallet.status === ConnectionStatus.Idle && !address) {
        wallet.openConnectWalletModal();
      } else if (isRequestStateError(requestState)) {
        if (requestState.error.message === "Invalid address") {
          navigate(AppRoutes.ErrorInvalidAddress);
        } else {
          toast.error(translate("PortfolioScreen.requestState.error"));
        }
      }
    },
    () =>
      isRequestStateError(requestState) || isRequestStateLoaded(requestState)
  );

  useEffect(() => {
    fetch({
      first: PROPOSAL_HISTORY_PAGE_SIZE,
      after: after,
      tab: selectedTab,
      address,
    });
    setSearchParams({
      tab: selectedTab,
      page: (after / PROPOSAL_HISTORY_PAGE_SIZE + 1).toString(),
    });
  }, [address, after, fetch, selectedTab, setSearchParams]);

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

  if (!isRequestStateLoaded(requestState)) {
    return (
      <div className={cn("flex", "justify-center", "items-center", "h-full")}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!requestState.data.portfolio) return null;

  const { portfolio, ...restData } = requestState.data;

  return (
    <div className={cn("flex", "flex-col")}>
      <PortfolioPanel portfolio={portfolio} isYourPortfolio={isYourPortfolio} />
      <ProposalHistory
        data={restData}
        address={address}
        tabs={filterItems}
        selectedTab={selectedTab}
        onSelectTab={handleSelectTab}
        pageSize={PROPOSAL_HISTORY_PAGE_SIZE}
        currentOffset={after}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PortfolioScreen;
