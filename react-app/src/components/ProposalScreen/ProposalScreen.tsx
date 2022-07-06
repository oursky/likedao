import React, { useCallback, useEffect, useMemo } from "react";
import cn from "classnames";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";
import AppButton from "../common/Buttons/AppButton";
import AppRoutes from "../../navigation/AppRoutes";
import * as RequestState from "../../models/RequestState";
import PageContoller from "../common/PageController/PageController";
import FilterTabs, { IFilterTabItem } from "../Tabs/FilterTabs";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { useLocale } from "../../providers/AppLocaleProvider";
import { useProposalsQuery, FilterKey } from "./ProposalScreenAPI";
import { ProposalList } from "./ProposalList";

const PROPOSAL_LIST_PAGE_SIZE = 5;

type ProposalTabItem = IFilterTabItem<FilterKey>;

const defaultTabItems: ProposalTabItem[] = [
  {
    label: "ProposalScreen.filters.all",
    value: "all",
  },
  {
    label: "ProposalScreen.filters.voting",
    value: "voting",
  },
  {
    label: "ProposalScreen.filters.deposit",
    value: "deposit",
  },
  {
    label: "ProposalScreen.filters.passed",
    value: "passed",
  },
  {
    label: "ProposalScreen.filters.rejected",
    value: "rejected",
  },
];

/**
 * Tab shown on first visit to page
 */
const defaultTabItem = defaultTabItems[0];

const ProposalScreen: React.FC = () => {
  const wallet = useWallet();
  const { translate } = useLocale();

  const [searchParams, setSearchParams] = useSearchParams({
    tab: defaultTabItem.value,
    page: "1",
  });

  const tabItems: ProposalTabItem[] = useMemo(() => {
    if (wallet.status === ConnectionStatus.Connected) {
      const followingTab = {
        value: "following" as const,
        label: "ProposalScreen.filters.following" as const,
      };
      return [...defaultTabItems, followingTab];
    }

    return defaultTabItems;
  }, [wallet]);

  const [after, selectedTab] = useMemo(() => {
    const after =
      (parseInt(searchParams.get("page") ?? "1", 10) - 1) *
      PROPOSAL_LIST_PAGE_SIZE;
    const tab = (
      tabItems.find((item) => item.value === searchParams.get("tab")) ??
      defaultTabItem
    ).value;
    return [after, tab];
  }, [searchParams, tabItems]);

  const { requestState, fetch } = useProposalsQuery(
    after,
    PROPOSAL_LIST_PAGE_SIZE
  );

  const setPage = useCallback(
    (after: number) => {
      setSearchParams({
        tab: selectedTab,
        page: (after / PROPOSAL_LIST_PAGE_SIZE + 1).toString(),
      });
    },
    [selectedTab, setSearchParams]
  );

  const handleSelectTab = useCallback(
    (tab: FilterKey) => {
      setSearchParams({
        tab: tab,
        page: (after / PROPOSAL_LIST_PAGE_SIZE + 1).toString(),
      });
    },
    [after, setSearchParams]
  );

  useEffect(() => {
    fetch({
      first: PROPOSAL_LIST_PAGE_SIZE,
      after,
      tab: selectedTab,
    });
  }, [after, fetch, selectedTab, setSearchParams]);

  useEffect(() => {
    if (RequestState.isRequestStateError(requestState)) {
      toast.error(translate("ProposalScreen.requestState.error"));
    }
  }, [requestState, translate]);

  return (
    <div
      className={cn(
        "flex-1",
        "bg-white",
        "rounded-lg",
        "drop-shadow",
        "px-5",
        "py-6",
        "h-min",
        "w-full"
      )}
    >
      <div className={cn("flex", "flex-row", "gap-x-2.5", "items-center")}>
        <Icon
          icon={IconType.Vote}
          fill="currentColor"
          height={24}
          width={24}
          className={cn("text-likecoin-black")}
        />
        <h1
          className={cn(
            "text-lg",
            "leading-none",
            "font-bold",
            "text-likecoin-black"
          )}
        >
          <LocalizedText messageID="ProposalScreen.title" />
        </h1>
      </div>

      <div className={cn("flex", "flex-col", "mt-9")}>
        <div
          className={cn(
            "w-full",
            "flex",
            "flex-row",
            "gap-x-2.5",
            "justify-between"
          )}
        >
          {/* TODO: Implement search bar */}
          <div
            className={cn(
              "w-full",
              "max-w-[320px]",
              "flex",
              "items-center",
              "justify-center"
            )}
          ></div>
          <AppButton
            className={cn("whitespace-nowrap")}
            type="link"
            size="small"
            theme="primary"
            messageID="ProposalScreen.newProposal"
            to={AppRoutes.NewProposal}
          />
        </div>
        {/* TODO: Align loading state height with empty state */}
        {/* TODO: Update empty state design */}
        {RequestState.isRequestStateLoading(requestState) ||
        RequestState.isRequestStateInitial(requestState) ? (
          <div className={cn("h-96", "flex", "items-center", "justify-center")}>
            <Icon
              icon={IconType.Ellipse}
              className={cn("animate-spin")}
              height={24}
              width={24}
            />
          </div>
        ) : (
          <div className={cn("mt-3.5", "flex", "flex-col", "gap-y-4")}>
            <FilterTabs<FilterKey>
              tabs={tabItems}
              selectedTab={selectedTab}
              onSelectTab={handleSelectTab}
            />
            <ProposalList
              proposals={
                !RequestState.isRequestStateError(requestState)
                  ? requestState.data.proposals
                  : []
              }
            />
            <PageContoller
              offsetBased={true}
              pageSize={PROPOSAL_LIST_PAGE_SIZE}
              totalItems={
                !RequestState.isRequestStateError(requestState)
                  ? requestState.data.totalCount
                  : 0
              }
              currentOffset={after}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalScreen;
