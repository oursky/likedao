import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import { useSearchParams } from "react-router-dom";
import Paper from "../common/Paper/Paper";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";
import FilterTabs, { IFilterTabItem } from "../Tabs/FilterTabs";
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
      <div className={cn("flex", "flex-col", "mt-9")}>
        <FilterTabs<FilterKey>
          tabs={defaultTabItems}
          selectedTab={selectedTab}
          onSelectTab={handleSelectTab}
        />
      </div>
    </Paper>
  );
};

export default ValidatorScreen;
