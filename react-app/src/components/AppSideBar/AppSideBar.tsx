import React, { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { useLocation } from "react-router-dom";
import IconButton from "../common/Buttons/IconButton";
import { IconType } from "../common/Icons/Icons";
import Divider from "../common/Divider/Divider";
import AppNavigationMenu from "../AppNavigationMenu/AppNavigationMenu";

import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { isRequestStateLoaded } from "../../models/RequestState";
import { ChainHealth, ChainStatus } from "../../generated/graphql";
import { useCosmos } from "../../api/cosmosAPI";
import { useChainHealthQuery } from "./AppSideBarAPI";
import { Header } from "./Header";
import { LoginPanel } from "./LoginPanel";
import { UserInfo, UserInfoPanel } from "./UserInfoPanel";
import { AddressBar } from "./AddressBar";

interface AppSideBarProps {
  children?: React.ReactNode;
}

const AppSideBar: React.FC<AppSideBarProps> = (props) => {
  const { children } = props;
  const location = useLocation();
  const wallet = useWallet();
  const cosmosAPI = useCosmos();

  const chainHealthRequestState = useChainHealthQuery();
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

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

  // TODO: Handle shortcuts
  const onSend = useCallback(() => {}, []);
  const onReceive = useCallback(() => {}, []);
  const onCollectReward = useCallback(() => {}, []);
  const onReinvest = useCallback(() => {}, []);

  useEffect(() => {
    if (wallet.status !== ConnectionStatus.Connected) return;
    cosmosAPI
      .getBalance()
      .then((balance) => {
        setUserInfo({ balance, address: wallet.account.address });
      })
      .catch((e) => {
        console.error("Failed to fetch user balance =", e);
      });
  }, [cosmosAPI, wallet]);

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
        <div className={cn("flex-0", "flex", "flex-col", "sm:w-72")}>
          <div className={cn("flex", "flex-row", "order-1", "sm:flex-col")}>
            <Header chainHealth={chainHealth} />
            <IconButton
              icon={isMenuActive ? IconType.X : IconType.Menu}
              size={24}
              className={cn("sm:hidden")}
              onClick={toggleMobileMenuMenu}
            />
          </div>
          {wallet.status !== ConnectionStatus.Connected ? (
            <LoginPanel
              className={cn("order-2", "my-6")}
              onConnect={wallet.openConnectWalletModal}
            />
          ) : (
            <div
              className={cn(
                "order-3",
                "flex-col",
                "gap-y-6",
                "hidden",
                "sm:flex"
              )}
            >
              <Divider />
              <UserInfoPanel
                className={cn("order-3")}
                userInfo={userInfo}
                onClickSend={onSend}
                onClickReceive={onReceive}
                onClickReward={onCollectReward}
                onClickReinvest={onReinvest}
              />
            </div>
          )}
          <div
            className={cn(
              "hidden",
              "sm:flex",
              "flex-col",
              "gap-y-4",
              "mb-6",
              wallet.status === ConnectionStatus.Connected
                ? "order-2"
                : "order-3"
            )}
          >
            {wallet.status === ConnectionStatus.Connected && (
              <AddressBar
                address={userInfo?.address ?? ""}
                onDisconnect={wallet.disconnect}
              />
            )}
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
            {wallet.status === ConnectionStatus.Connected && (
              <div className={cn("flex", "flex-col", "gap-y-6")}>
                <Divider />
                <UserInfoPanel
                  userInfo={userInfo}
                  onClickSend={onSend}
                  onClickReceive={onReceive}
                  onClickReward={onCollectReward}
                  onClickReinvest={onReinvest}
                />
                <AddressBar
                  address={userInfo?.address ?? ""}
                  onDisconnect={wallet.disconnect}
                />
              </div>
            )}
          </div>
          <main className={cn("flex", "flex-1")}>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppSideBar;
