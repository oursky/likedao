import React, { useCallback } from "react";
import cn from "classnames";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";

export interface IFilterTabItem<T> {
  label: MessageID;
  value: T;
}

interface FilterTabItemProps<T> {
  item: IFilterTabItem<T>;
  isSelected: boolean;
  onSelect: (value: T) => void;
}
const FilterTabItem: <T>(props: FilterTabItemProps<T>) => React.ReactElement = (
  props
) => {
  const { item, isSelected, onSelect } = props;

  const onItemSelect = useCallback(() => {
    onSelect(item.value);
  }, [onSelect, item]);

  return (
    <button
      type="button"
      className={cn(
        "text-sm",
        "font-medium",
        "leading-5",
        "whitespace-nowrap",
        "border-b-2",
        "py-4",
        "px-1",
        isSelected
          ? cn("border-app-green", "text-app-green")
          : cn(
              "border-transparent",
              "text-gray-500",
              "hover:text-gray-700",
              "hover:border-gray-300"
            )
      )}
      onClick={onItemSelect}
    >
      <LocalizedText messageID={item.label} />
    </button>
  );
};

interface FilterTabsProps<T> {
  className?: string;
  tabs: IFilterTabItem<T>[];
  selectedTab: T;
  onSelectTab: (tab: T) => void;
}

const FilterTabs: <T extends string | number>(
  props: FilterTabsProps<T>
) => React.ReactElement = (props) => {
  const { tabs, selectedTab, onSelectTab, className } = props;

  return (
    <div className={cn("border-b", "border-gray-200", className)}>
      <nav
        className={cn("-mb-px", "flex", "space-x-8", "overflow-x-auto")}
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <FilterTabItem
            key={tab.value}
            item={tab}
            isSelected={selectedTab === tab.value}
            onSelect={onSelectTab}
          />
        ))}
      </nav>
    </div>
  );
};

export default FilterTabs;
