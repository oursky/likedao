import React, { useCallback, useEffect, useMemo } from "react";
import cn from "classnames";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";
import AppButton from "../common/Buttons/AppButton";
import AppRoutes from "../../navigation/AppRoutes";
import {
  isRequestStateError,
  isRequestStateInitial,
  isRequestStateLoaded,
  isRequestStateLoading,
} from "../../models/RequestState";
import PageContoller from "../common/PageController/PageController";
import FilterTabs, { IFilterTabItem } from "../FilterTabs/FilterTabs";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { useLocale } from "../../providers/AppLocaleProvider";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import { FilterKey, useProposalsQuery } from "./ProposalScreenAPI";
import { ProposalList } from "./ProposalList";

const PROPOSAL_LIST_PAGE_SIZE = 5;

const defaultFilterItems: IFilterTabItem<FilterKey>[] = [
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

const ProposalScreen: React.FC = () => {
  const wallet = useWallet();
  const { translate } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();

  const [offset, filter, searchTerm] = useMemo(() => {
    const pageStr = searchParams.get("page") ?? "1";
    const filter = searchParams.get("filter") ?? "voting";
    const search = searchParams.get("search");

    const page = Math.max(parseInt(pageStr, 10), 1) - 1;

    return [page * PROPOSAL_LIST_PAGE_SIZE, filter as FilterKey, search];
  }, [searchParams]);

  const { requestState, fetch } = useProposalsQuery(
    offset,
    PROPOSAL_LIST_PAGE_SIZE
  );

  const filterItems: IFilterTabItem<FilterKey>[] = useMemo(() => {
    if (wallet.status === ConnectionStatus.Connected) {
      const followingTab: IFilterTabItem<FilterKey> = {
        label: "ProposalScreen.filters.following",
        value: "following",
      };
      return [...defaultFilterItems, followingTab];
    }

    return defaultFilterItems;
  }, [wallet]);

  const setPage = useCallback(
    (offset: number) => {
      const page = Math.floor(offset / PROPOSAL_LIST_PAGE_SIZE) + 1;
      const params = searchParams;
      params.set("page", page.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const setFilter = useCallback(
    (filter: FilterKey) => {
      const params = searchParams;
      params.set("filter", filter);
      params.set("page", "1");
      setSearchParams(params);
    },
    [setSearchParams, searchParams]
  );

  useEffect(() => {
    const address =
      wallet.status === ConnectionStatus.Connected
        ? wallet.account.address
        : undefined;
    fetch(offset, filter, address, searchTerm ?? undefined);
  }, [fetch, offset, filter, searchTerm, wallet]);

  useEffectOnce(
    () => {
      if (isRequestStateError(requestState)) {
        toast.error(translate("ProposalScreen.requestState.error"));
      }
    },
    () =>
      isRequestStateError(requestState) || isRequestStateLoaded(requestState)
  );

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
        {isRequestStateLoading(requestState) ||
        isRequestStateInitial(requestState) ? (
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
            <FilterTabs
              tabs={filterItems}
              selectedTab={filter}
              onSelectTab={setFilter}
            />
            <ProposalList
              proposals={
                !isRequestStateError(requestState)
                  ? requestState.data.proposals
                  : []
              }
            />
            <PageContoller
              offsetBased={true}
              pageSize={PROPOSAL_LIST_PAGE_SIZE}
              totalItems={
                !isRequestStateError(requestState)
                  ? requestState.data.totalCount
                  : 0
              }
              currentOffset={offset}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalScreen;
