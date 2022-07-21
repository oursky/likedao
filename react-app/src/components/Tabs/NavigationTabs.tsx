import React from "react";
import cn from "classnames";
import { NavLink } from "react-router-dom";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";

export interface INavigationTabItem {
  label: MessageID;
  route: string;
}

interface NavigationTabItemProps {
  item: INavigationTabItem;
  isSelected: boolean;
}
const NavigationTabItem: React.FC<NavigationTabItemProps> = (props) => {
  const { item, isSelected } = props;

  return (
    <NavLink
      to={item.route}
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
    >
      <LocalizedText messageID={item.label} />
    </NavLink>
  );
};

interface NavigationTabsProps {
  tabs: INavigationTabItem[];
  activeTab: string;
}

const FilterTabs: React.FC<NavigationTabsProps> = (props) => {
  const { tabs, activeTab } = props;

  return (
    <div className={cn("border-b", "border-gray-200")}>
      <nav
        className={cn("-mb-px", "flex", "space-x-8", "overflow-x-auto")}
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <NavigationTabItem
            key={tab.route}
            item={tab}
            isSelected={activeTab === tab.route}
          />
        ))}
      </nav>
    </div>
  );
};

export default FilterTabs;
