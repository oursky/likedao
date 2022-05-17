import React from "react";
import cn from "classnames";
import { useLocation } from "react-router-dom";
import AppNavigationMenu from "../AppNavigationMenu/AppNavigationMenu";

import Divider from "../common/Divider/Divider";
import LocalizedText from "../common/Localized/LocalizedText";
import { ReactComponent as LikeLogo } from "../../assets/likecoin-logo.svg";

const OverviewScreen: React.FC = () => {
  const location = useLocation();

  return (
    <div
      className={cn(
        "h-full",
        "w-full",
        "overflow-auto",
        "bg-gradient-to-b",
        "from-white",
        "to-likecoin-primary-bg",
        "p-8"
      )}
    >
      <div
        className={cn("h-full", "flex", "flex-row", "gap-4", "justify-center")}
      >
        <div
          className={cn(
            "flex-0",
            "flex",
            "flex-row",
            "gap-y-4",
            "sm:w-72",
            "sm:flex-col"
          )}
        >
          <div
            className={cn(
              "flex-1",
              "flex",
              "flex-row",
              "gap-x-4",
              "items-center",
              "sm:items-start",
              "sm:flex-col",
              "sm:gap-y-4",
              "sm:gap-x-0"
            )}
          >
            <LikeLogo height={48} width={48} />
            <h1
              className={cn(
                "text-base",
                "leading-5",
                "font-normal",
                "text-likecoin-green"
              )}
            >
              <LocalizedText messageID="AppSideBar.title" />
            </h1>
            {/* TODO: Implement chain switcher */}
            <div className={cn("h-5", "bg-pink-400", "text-sm")}>
              Chain Switcher
            </div>
          </div>
          {/* TODO: Handle login dialog  */}
          <div
            className={cn(
              "py-2",
              "h-[92px]",
              "bg-pink-400",
              "hidden",
              "sm:block"
            )}
          >
            Login
          </div>
          <Divider />
          <AppNavigationMenu
            activeRoute={location.pathname}
            className={cn("hidden", "sm:flex")}
          />
        </div>
        <div className={cn("flex-1", "bg-blue-400", "max-w-screen-2xl")}>
          <p>Main Content</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewScreen;
