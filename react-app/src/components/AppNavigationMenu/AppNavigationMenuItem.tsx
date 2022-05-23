import React, { useCallback } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import { IconType, Icon } from "../common/Icons/Icons";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";

interface NavigationMenuItemProps {
  labelId: MessageID;
  icon: IconType;
  isActive: boolean;
  navigateTo?: string;
  onNavigationItemSelect?: () => void;
}

const NavigationMenuItem: React.FC<NavigationMenuItemProps> = (props) => {
  const { labelId, icon, isActive, navigateTo, onNavigationItemSelect } = props;

  const onItemSelect = useCallback(() => {
    onNavigationItemSelect?.();
  }, [onNavigationItemSelect]);

  return (
    <li>
      <Link
        to={navigateTo ?? ""}
        className={cn(
          !navigateTo ? "pointer-events-none" : "",
          "flex",
          "flex-row",
          "items-center",
          "from-likecoin-gradient-from",
          "to-likecoin-gradient-to",
          "rounded-md",
          "group",
          "select-none",
          "p-2",
          isActive ? "bg-gradient-to-r" : "hover:bg-gray-50"
        )}
        onClick={onItemSelect}
      >
        <Icon
          icon={icon}
          height={24}
          width={24}
          fill="currentColor"
          className={cn(
            "flex-0",
            isActive
              ? "text-likecoin-green"
              : "text-likecoin-lightgreen group-hover:text-gray-900"
          )}
        />
        <h2
          className={cn(
            "ml-3",
            "flex-1",
            "text-left",
            "text-xl",
            "font-medium",
            "leading-5",
            isActive
              ? "text-likecoin-green"
              : "text-likecoin-lightgreen group-hover:text-gray-900"
          )}
        >
          <LocalizedText messageID={labelId} />
        </h2>
      </Link>
    </li>
  );
};

export default NavigationMenuItem;
