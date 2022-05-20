import React, { useCallback, useMemo, useState } from "react";
import cn from "classnames";
import { useLocation } from "react-router-dom";
import IconButton from "../common/Buttons/IconButton";
import { IconType } from "../common/Icons/Icons";
import Divider from "../common/Divider/Divider";
import AppNavigationMenu from "../AppNavigationMenu/AppNavigationMenu";

import { useWallet } from "../../providers/WalletProvider";
import { isRequestStateLoaded } from "../../models/RequestState";
import { ChainHealth, ChainStatus } from "../../generated/graphql";
import { useChainHealthQuery } from "./AppSideBarAPI";
import { Header } from "./Header";
import { LoginPanel } from "./LoginPanel";

interface AppSideBarProps {
  children?: React.ReactNode;
}

const AppSideBar: React.FC<AppSideBarProps> = (props) => {
  const { children } = props;
  const location = useLocation();
  const wallet = useWallet();

  const chainHealthRequestState = useChainHealthQuery();
  const [isMenuActive, setIsMenuActive] = useState(false);

  const chainHealth = useMemo((): ChainHealth => {
    if (isRequestStateLoaded(chainHealthRequestState)) {
      return chainHealthRequestState.data;
    }

    return {
      height: 0,
      status: ChainStatus.Offline,
    };
  }, [chainHealthRequestState]);

  const openMobileMenu = useCallback(() => {
    setIsMenuActive(true);
  }, [setIsMenuActive]);

  const closeMobileMenu = useCallback(() => {
    setIsMenuActive(false);
  }, [setIsMenuActive]);

  const toggleMobileMenuMenu = useCallback(() => {
    if (isMenuActive) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }, [closeMobileMenu, isMenuActive, openMobileMenu]);

  return (
    <div
      className={cn(
        "h-full",
        "w-full",
        "overflow-auto",
        "bg-gradient-to-b",
        "from-white",
        "to-likecoin-primary-bg",
        "p-3",
        "sm:p-8"
      )}
    >
      <div
        className={cn(
          "h-full",
          "flex",
          "flex-col",
          "gap-x-4",
          "gap-y-6",
          "justify-center",
          "sm:gap-y-4",
          "sm:flex-row"
        )}
      >
        <div className={cn("flex-0", "flex", "flex-col", "gap-y-6", "sm:w-72")}>
          <div className={cn("flex", "flex-row", "sm:flex-col")}>
            <Header chainHealth={chainHealth} />
            <IconButton
              icon={isMenuActive ? IconType.X : IconType.Menu}
              size={24}
              className={cn("sm:hidden")}
              onClick={toggleMobileMenuMenu}
            />
          </div>
          {!wallet.isConnected ? (
            <LoginPanel onConnect={wallet.openConnectWalletModal} />
          ) : // Handle connected panel
          null}
          <div className={cn("hidden", "sm:flex", "flex-col", "gap-y-6")}>
            <Divider />
            <AppNavigationMenu
              activeRoute={location.pathname}
              className={cn("pb-6")}
              onMenuItemSelect={closeMobileMenu}
            />
          </div>
        </div>
        <div className={cn("flex-1", "flex", "relative", "max-w-screen-2xl")}>
          <div
            className={cn(
              isMenuActive ? "flex" : "hidden",
              "h-full",
              "left-0",
              "right-0",
              "bg-gradient-to-b",
              "from-white",
              "to-likecoin-primary-bg",
              "absolute",
              "flex-col",
              "gap-y-6",
              "z-10",
              "sm:hidden"
            )}
          >
            <Divider />
            <AppNavigationMenu
              activeRoute={location.pathname}
              className={cn("pb-6")}
              onMenuItemSelect={closeMobileMenu}
            />
          </div>
          <main className={cn("flex", "flex-1")}>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppSideBar;
