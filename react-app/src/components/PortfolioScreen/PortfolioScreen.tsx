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
import { ProposalHistoryFilterKey } from "../ProposalHistory/ProposalHistoryModel";
import Paper from "../common/Paper/Paper";
import ProposalHistory, {
  ProposalHistoryTabItem,
} from "../ProposalHistory/ProposalHistory";
import {
  usePortfolioQuery,
  useProposalHistoryQuery,
} from "./PortfolioScreenAPI";
import PortfolioPanel from "./PortfolioPanel";
import StakesPanel from "./StakesPanel";

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
  const { address: addressFromUrl } = useParams();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams({
    tab: "voted",
    page: "1",
  });

  const {
    requestState: portfolioRequestState,
    fetch: fetchPortfolio,
    stakesOrder,
    setStakesOrder,
  } = usePortfolioQuery();

  const {
    requestState: proposalHistoryRequestState,
    fetch: fetchProposalHistory,
  } = useProposalHistoryQuery();

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
    }
  }, [address, fetchPortfolio]);

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
          portfolio={portfolioRequestState.data.portfolio}
          isYourPortfolio={isYourPortfolio}
        />
      ) : (
        <Paper className={cn("flex", "justify-center", "items-center")}>
          <LoadingSpinner />
        </Paper>
      )}

      {isRequestStateLoaded(portfolioRequestState) ? (
        <StakesPanel
          stakes={portfolioRequestState.data.stakes}
          isYourPortfolio={isYourPortfolio}
          order={stakesOrder}
          setOrder={setStakesOrder}
        />
      ) : (
        <Paper className={cn("flex", "justify-center", "items-center")}>
          <LoadingSpinner />
        </Paper>
      )}

      {isRequestStateLoaded(proposalHistoryRequestState) &&
      isRequestStateLoaded(portfolioRequestState) ? (
        <ProposalHistory
          data={proposalHistoryRequestState.data}
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
