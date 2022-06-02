import React from "react";
import cn from "classnames";

import { IconType } from "../common/Icons/Icons";
import AppRoutes from "../../navigation/AppRoutes";
import NavigationMenuItem from "./AppNavigationMenuItem";

interface AppNavigationMenuProps {
  activeRoute: string;
  className?: string;
  onMenuItemSelect?: () => void;
}

const AppNavigationMenu: React.FC<AppNavigationMenuProps> = (props) => {
  const { activeRoute, className, onMenuItemSelect } = props;

  return (
    <ul className={cn("flex", "flex-col", "gap-y-5", className)}>
      <NavigationMenuItem
        labelId="AppSideBar.navigation.overview"
        icon={IconType.Home}
        isActive={activeRoute === AppRoutes.Overview}
        navigateTo={AppRoutes.Overview}
        onNavigationItemSelect={onMenuItemSelect}
      />
      <NavigationMenuItem
        labelId="AppSideBar.navigation.proposals"
        icon={IconType.Vote}
        isActive={activeRoute === AppRoutes.Proposals}
        navigateTo={AppRoutes.Proposals}
        onNavigationItemSelect={onMenuItemSelect}
      />
      <NavigationMenuItem
        labelId="AppSideBar.navigation.validators"
        icon={IconType.Validator}
        isActive={false}
        onNavigationItemSelect={onMenuItemSelect}
      />
      <NavigationMenuItem
        labelId="AppSideBar.navigation.portfolio"
        icon={IconType.PieChart}
        isActive={false}
        onNavigationItemSelect={onMenuItemSelect}
      />
    </ul>
  );
};

export default AppNavigationMenu;
