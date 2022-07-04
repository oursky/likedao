import React, { useCallback, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import cn from "classnames";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  const { address: urlAddress } = useParams();

  const [searchParams, setSearchParams] = useSearchParams({
    tab: "voted",
    page: "1",
  });

  const address = useMemo(() => {
    if (urlAddress) {
      return urlAddress;
    }
    if (wallet.status === ConnectionStatus.Connected) {
      return wallet.account.address;
    }
    return "";
  }, [urlAddress, wallet]);

  const isYourPortfolio = useMemo(() => !address, [address]);

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
        page: (after / PROPOSAL_HISTORY_PAGE_SIZE + 1).toString(),
      });
    },
    [after, setSearchParams]
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

    // proposalHistoryQuery shouldn't be in the deps arr
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, after, proposalHistoryQuery.fetch, selectedTab]);

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
