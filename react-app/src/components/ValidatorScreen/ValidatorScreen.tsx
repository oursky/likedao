import React, { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";
import FilterTabs, { IFilterTabItem } from "../Tabs/FilterTabs";
import * as Table from "../common/Table";
import AppRoutes from "../../navigation/AppRoutes";
import PageContoller from "../common/PageController/PageController";
import { BigNumberCoinDelegatorReward } from "../../models/distribution";
import { BigNumberDelegation } from "../../models/staking";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { useDistributionAPI } from "../../api/distributionAPI";
import { useStakingAPI } from "../../api/stakingAPI";
import { useLocale } from "../../providers/AppLocaleProvider";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import {
  isRequestStateError,
  isRequestStateLoaded,
} from "../../models/RequestState";
import { ValidatorBondingStatus } from "../../generated/graphql";
import {
  FilterKey,
  useValidatorsQuery,
  ValidatorSortableColumn,
} from "./ValidatorScreenAPI";
import { Validator } from "./ValidatorScreenModel";

const VALIDATOR_LIST_PAGE_SIZE = 20;

type ValidatorTabItem = IFilterTabItem<FilterKey>;

const defaultTabItems: ValidatorTabItem[] = [
  {
    label: "ValidatorScreen.filters.active",
    value: "active",
  },
  {
    label: "ValidatorScreen.filters.inactive",
    value: "inactive",
  },
  {
    label: "ValidatorScreen.filters.all",
    value: "all",
  },
];

const defaultTabItem = defaultTabItems[0];

const ValidatorScreen: React.FC = () => {
  const wallet = useWallet();
  const stakingAPI = useStakingAPI();
  const distributionAPI = useDistributionAPI();

  const { translate } = useLocale();

  const [searchParams, setSearchParams] = useSearchParams({
    tab: defaultTabItem.value,
    page: "1",
  });

  const [delegations, setDelegations] = useState<BigNumberDelegation[]>([]);
  const [rewards, setRewards] = useState<BigNumberCoinDelegatorReward[]>([]);

  const [after, selectedTab, sortOrder] = useMemo(() => {
    const after =
      (parseInt(searchParams.get("page") ?? "1", 10) - 1) *
      VALIDATOR_LIST_PAGE_SIZE;

    const tab = (
      defaultTabItems.find((i) => i.value === searchParams.get("tab")) ??
      defaultTabItem
    ).value;

    const sortBy = searchParams.get("sortBy");
    const sortDirection = searchParams.get("sortDirection");

    const sortOrder =
      sortBy && sortDirection
        ? {
            id: sortBy as ValidatorSortableColumn,
            direction: sortDirection as Table.ColumnOrder["direction"],
          }
        : undefined;

    return [after, tab, sortOrder];
  }, [searchParams]);

  const { fetch, requestState } = useValidatorsQuery(
    0,
    VALIDATOR_LIST_PAGE_SIZE
  );

  const setPage = useCallback(
    (after: number) => {
      setSearchParams({
        tab: selectedTab,
        page: (after / VALIDATOR_LIST_PAGE_SIZE + 1).toString(),
      });
    },
    [selectedTab, setSearchParams]
  );

  const handleSelectTab = useCallback(
    (tab: FilterKey) => {
      setSearchParams({
        tab,
        page: "1",
      });
    },
    [setSearchParams]
  );

  const handleSort = useCallback(
    (sortOrder: Table.ColumnOrder) => {
      setSearchParams({
        tab: selectedTab,
        page: (after / VALIDATOR_LIST_PAGE_SIZE + 1).toString(),
        sortBy: sortOrder.id,
        sortDirection: sortOrder.direction,
      });
    },
    [after, selectedTab, setSearchParams]
  );

  const [validators, totalCount] = useMemo(() => {
    if (!isRequestStateLoaded(requestState)) {
      return [[], 0];
    }

    return [requestState.data.validators, requestState.data.totalCount];
  }, [requestState]);

  useEffect(() => {
    fetch({
      first: VALIDATOR_LIST_PAGE_SIZE,
      after: after,
      order: sortOrder
        ? {
            id: sortOrder.id,
            direction: sortOrder.direction,
          }
        : null,
      filter: selectedTab,
    });
  }, [after, fetch, selectedTab, sortOrder]);

  useEffect(() => {
    if (wallet.status !== ConnectionStatus.Connected) return;

    Promise.all([
      stakingAPI.getDelegatorStakes(wallet.account.address),
      distributionAPI.getAllDelegatorDelegationRewards(wallet.account.address),
    ])
      .then(([delegations, rewards]) => {
        setDelegations(delegations);
        setRewards(rewards);
      })
      .catch((err) => {
        console.error("Error fetching delegations and rewards", err);
        toast.error(translate("ValidatorScreen.delegationRewards.error"), {
          toastId: "ValidatorScreen.delegation_rewards.error",
        });
      });
  }, [wallet, stakingAPI, distributionAPI, translate]);

  useEffectOnce(
    () => {
      if (isRequestStateError(requestState)) {
        toast.error(translate("ValidatorScreen.requestState.error"));
      }
    },
    () =>
      isRequestStateError(requestState) || isRequestStateLoaded(requestState)
  );

  return (
    <div
      className={cn(
        "flex-1",
        "flex",
        "flex-col",
        "bg-white",
        "rounded-lg",
        "drop-shadow",
        "gap-y-4",
        "py-6",
        "h-min",
        "w-full"
      )}
    >
      <div className={cn("flex", "flex-col", "px-5")}>
        <div className={cn("flex", "flex-row", "gap-x-2.5", "items-center")}>
          <Icon
            icon={IconType.Validator}
            fill="currentColor"
            height={24}
            width={24}
            className={cn("text-app-black")}
          />
          <h1
            className={cn(
              "text-lg",
              "leading-none",
              "font-bold",
              "text-app-black"
            )}
          >
            <LocalizedText messageID="ValidatorScreen.title" />
          </h1>
        </div>
        <div className={cn("flex", "flex-col", "mt-9", "gap-y-4")}>
          <FilterTabs<FilterKey>
            tabs={defaultTabItems}
            selectedTab={selectedTab}
            onSelectTab={handleSelectTab}
          />

          <Table.Table
            items={validators}
            isLoading={!isRequestStateLoaded(requestState)}
            sortOrder={sortOrder}
            onSort={handleSort}
          >
            <Table.Column<Validator>
              id="name"
              titleId="ValidatorScreen.validatorList.name"
              sortable={true}
            >
              {(item) => {
                const isActive =
                  !item.jailed && item.status === ValidatorBondingStatus.Bonded;
                return (
                  <div className={cn("flex", "flex-row")}>
                    <div
                      className={cn(
                        "flex-shrink-0",
                        "w-9",
                        "h-9",
                        "leading-none",
                        "rounded-full",
                        "bg-blue-700",
                        "bg-cover"
                      )}
                      style={{
                        backgroundImage:
                          item.avatarUrl != null
                            ? `url(${item.avatarUrl})`
                            : undefined,
                      }}
                    />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-app-green">
                        <Link
                          to={AppRoutes.ValidatorDetail.replace(
                            ":address",
                            item.operatorAddress!
                          )}
                        >
                          {item.moniker ?? item.operatorAddress}
                        </Link>
                      </h3>
                      <p
                        className={cn(
                          "text-xs",
                          "font-medium",
                          "leading-[14px]",
                          isActive
                            ? "text-app-vote-color-yes"
                            : "text-app-vote-color-no"
                        )}
                      >
                        <LocalizedText
                          messageID={
                            isActive
                              ? "ValidatorScreen.validatorList.active"
                              : "ValidatorScreen.validatorList.inactive"
                          }
                        />
                      </p>
                    </div>
                  </div>
                );
              }}
            </Table.Column>
            <Table.Column<Validator>
              id="votingPower"
              titleId="ValidatorScreen.validatorList.votingPower"
              sortable={true}
            >
              {(item) => (
                <span
                  className={cn(
                    "font-normal",
                    "text-sm",
                    "leading-5",
                    "text-gray-500"
                  )}
                >
                  {`${(item.votingPower * 100).toFixed(2)}%`}
                </span>
              )}
            </Table.Column>
            <Table.Column<Validator>
              id="staked"
              titleId="ValidatorScreen.validatorList.staked"
              sortable={false}
            >
              {(item) => {
                const delegation = delegations.find(
                  (d) => d.delegation.validatorAddress === item.operatorAddress
                );
                return (
                  <span
                    className={cn(
                      "font-normal",
                      "text-sm",
                      "leading-5",
                      "text-gray-500"
                    )}
                  >
                    {delegation ? delegation.balance.amount.toFixed(2) : "-"}
                  </span>
                );
              }}
            </Table.Column>
            <Table.Column<Validator>
              id="rewards"
              titleId="ValidatorScreen.validatorList.rewards"
              sortable={false}
            >
              {(item) => {
                const reward = rewards.find(
                  (r) => r.validatorAddress === item.operatorAddress
                );
                return (
                  <span
                    className={cn(
                      "font-normal",
                      "text-sm",
                      "leading-5",
                      "text-gray-500"
                    )}
                  >
                    {reward ? reward.reward.amount.toString() : "-"}
                  </span>
                );
              }}
            </Table.Column>
            <Table.Column<Validator>
              id="expectedReturns"
              titleId="ValidatorScreen.validatorList.expectedReturns"
              sortable={true}
            >
              {(item) => (
                <span
                  className={cn(
                    "font-normal",
                    "text-sm",
                    "leading-5",
                    "text-gray-500"
                  )}
                >
                  {`${(item.expectedReturns * 100).toFixed(2)}%`}
                </span>
              )}
            </Table.Column>
            <Table.Column<Validator>
              id="participations"
              titleId="ValidatorScreen.validatorList.participations"
              sortable={false}
            >
              {(item) => (
                <div className={cn("flex")}>
                  <span
                    className={cn(
                      "border",
                      "border-app-vote-color-yes",
                      "text-app-vote-color-yes",
                      "rounded-full",
                      "font-normal",
                      "text-sm",
                      "leading-5",
                      "px-2.5"
                    )}
                  >
                    {item.participatedProposalCount}/
                    {item.relativeTotalProposalCount}
                  </span>
                </div>
              )}
            </Table.Column>
            <Table.Column<Validator>
              id="uptime"
              titleId="ValidatorScreen.validatorList.uptime"
              sortable={true}
            >
              {(item) => (
                <span
                  className={cn(
                    "font-normal",
                    "text-sm",
                    "leading-5",
                    "text-gray-500"
                  )}
                >
                  {`${(item.uptime * 100).toFixed(2)}%`}
                </span>
              )}
            </Table.Column>
          </Table.Table>
        </div>
      </div>
      <PageContoller
        offsetBased={true}
        pageSize={VALIDATOR_LIST_PAGE_SIZE}
        totalItems={totalCount}
        currentOffset={after}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ValidatorScreen;
