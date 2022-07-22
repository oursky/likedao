import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import { Link, useSearchParams } from "react-router-dom";
import Paper from "../common/Paper/Paper";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";
import FilterTabs, { IFilterTabItem } from "../Tabs/FilterTabs";
import * as Table from "../common/Table";
import AppRoutes from "../../navigation/AppRoutes";
import { FilterKey } from "./ValidatorScreenAPI";

type ValidatorTabItem = IFilterTabItem<FilterKey>;

const defaultTabItems: ValidatorTabItem[] = [
  {
    label: "ValidatorScreen.filters.all",
    value: "all",
  },
  {
    label: "ValidatorScreen.filters.active",
    value: "active",
  },
  {
    label: "ValidatorScreen.filters.inactive",
    value: "inactive",
  },
];

const defaultTabItem = defaultTabItems[0];

const ValidatorScreen: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams({
    tab: defaultTabItem.value,
  });

  const [selectedTab] = useMemo(() => {
    const tab = (
      defaultTabItems.find((i) => i.value === searchParams.get("tab")) ??
      defaultTabItem
    ).value;
    return [tab];
  }, [searchParams]);

  const handleSelectTab = useCallback(
    (tab: FilterKey) => {
      setSearchParams({
        tab,
      });
    },
    [setSearchParams]
  );

  const dummyItems: any[] = new Array(20).fill(null).map((_, i) => ({
    validator: {
      operatorAddress: `like1${i}`,
      description: {
        moniker: `Validator #${i}`,
      },
    },
  }));

  return (
    <Paper className={cn("flex", "flex-col")}>
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

        <Table.Table items={dummyItems}>
          <Table.Column<any>
            id="name"
            titleId="ValidatorScreen.validatorList.name"
            sortable={true}
          >
            {(item) => (
              <div className={cn("flex", "flex-row")}>
                <div
                  className={cn(
                    "flex-shrink-0",
                    "w-9",
                    "h-9",
                    "leading-none",
                    "rounded-full",
                    "bg-blue-700"
                  )}
                />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-app-green">
                    <Link
                      to={AppRoutes.ValidatorDetail.replace(
                        ":address",
                        item.validator.operatorAddress
                      )}
                    >
                      {item.validator.description.moniker}
                    </Link>
                  </h3>
                  <p
                    className={cn(
                      "text-xs",
                      "font-medium",
                      "leading-[14px]",
                      "text-app-vote-color-yes"
                    )}
                  >
                    <LocalizedText messageID="StakesPanel.active" />
                  </p>
                </div>
              </div>
            )}
          </Table.Column>
          <Table.Column<any>
            id="votingPower"
            titleId="ValidatorScreen.validatorList.votingPower"
            sortable={true}
          >
            {(_) => (
              <span
                className={cn(
                  "font-normal",
                  "text-sm",
                  "leading-5",
                  "text-gray-500"
                )}
              >
                8.35%
              </span>
            )}
          </Table.Column>
          <Table.Column<any>
            id="staked"
            titleId="ValidatorScreen.validatorList.staked"
            sortable={true}
          >
            {(_) => (
              <span
                className={cn(
                  "font-normal",
                  "text-sm",
                  "leading-5",
                  "text-gray-500"
                )}
              >
                3.12
              </span>
            )}
          </Table.Column>
          <Table.Column<any>
            id="rewards"
            titleId="ValidatorScreen.validatorList.rewards"
            sortable={true}
          >
            {(_) => (
              <span
                className={cn(
                  "font-normal",
                  "text-sm",
                  "leading-5",
                  "text-gray-500"
                )}
              >
                0.017752492
              </span>
            )}
          </Table.Column>
          <Table.Column<any>
            id="expectedReturns"
            titleId="ValidatorScreen.validatorList.expectedReturns"
            sortable={true}
          >
            {(_) => (
              <span
                className={cn(
                  "font-normal",
                  "text-sm",
                  "leading-5",
                  "text-gray-500"
                )}
              >
                15.76%
              </span>
            )}
          </Table.Column>
          <Table.Column<any>
            id="participations"
            titleId="ValidatorScreen.validatorList.participations"
            sortable={true}
          >
            {(_) => (
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
                  10/15
                </span>
              </div>
            )}
          </Table.Column>
          <Table.Column<any>
            id="uptime"
            titleId="ValidatorScreen.validatorList.uptime"
            sortable={true}
          >
            {(_) => (
              <span
                className={cn(
                  "font-normal",
                  "text-sm",
                  "leading-5",
                  "text-gray-500"
                )}
              >
                100%
              </span>
            )}
          </Table.Column>
        </Table.Table>
      </div>
    </Paper>
  );
};

export default ValidatorScreen;
