import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import IconButton from "../common/Buttons/IconButton";
import { IconType } from "../common/Icons/Icons";
import Divider from "../common/Divider/Divider";
import AppNavigationMenu from "../AppNavigationMenu/AppNavigationMenu";

import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import {
  isRequestStateError,
  isRequestStateLoaded,
} from "../../models/RequestState";
import { useCosmosAPI } from "../../api/cosmosAPI";
import { useTransaction } from "../../providers/TransactionProvider";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import { useLocale } from "../../providers/AppLocaleProvider";
import Config from "../../config/Config";
import Footer from "../Footer/Footer";
import { useChainHealthQuery } from "./AppSideBarAPI";
import { Header } from "./Header";
import { LoginPanel } from "./LoginPanel";
import { UserInfo, UserInfoPanel } from "./UserInfoPanel";
import { AddressBar } from "./AddressBar";

interface AppSideBarProps {
  children?: React.ReactNode;
}

// eslint-disable-next-line complexity
const AppSideBar: React.FC<AppSideBarProps> = (props) => {
  const { children } = props;
  const { translate } = useLocale();
  const location = useLocation();
  const wallet = useWallet();
  const cosmosAPI = useCosmosAPI();
  const transaction = useTransaction();

  const chainHealthRequestState = useChainHealthQuery();
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const chainId = Config.chainInfo.chainId;

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

  useEffectOnce(
    () => {
      if (isRequestStateError(chainHealthRequestState)) {
        toast.error(
          translate("AppSideBar.requestState.error", {
            chainId,
          })
        );
      }
    },
    () =>
      isRequestStateError(chainHealthRequestState) ||
      isRequestStateLoaded(chainHealthRequestState)
  );

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "min-h-screen",
        "justify-between",
        "w-full",
        isMenuActive && "fixed"
      )}
    >
      <div className={cn("h-full", "w-full", "overflow-auto", "sm:p-8")}>
        <div
          className={cn(
            "flex",
            "flex-col",
            "gap-x-4",
            "gap-y-6",
            "justify-center",
            "sm:gap-y-4",
            "sm:flex-row"
          )}
        >
          <div
            className={cn(
              "flex-0",
              "flex",
              "flex-col",
              "px-3",
              "pt-3",
              "sm:p-0",
              "sm:w-72"
            )}
          >
            <div className={cn("flex", "flex-row", "order-1", "sm:flex-col")}>
              <Header
                chainHealth={
                  isRequestStateLoaded(chainHealthRequestState)
                    ? chainHealthRequestState.data
                    : undefined
                }
              />
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
                  onClickSend={transaction.openSendTokenModal}
                  onClickReceive={transaction.openReceiveTokenModal}
                  onClickReward={transaction.openCollectRewardsModal}
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
          <div
            className={cn(
              "flex-1",
              "flex",
              "relative",
              "px-3",
              "sm:max-w-screen-2xl",
              "sm:px-0"
            )}
          >
            <div
              className={cn(
                isMenuActive ? "flex" : "hidden",
                "h-[calc(100vh_-_5.25rem)]",
                "left-0",
                "right-0",
                "bg-gradient-to-b",
                "from-white",
                "to-likecoin-primary-bg",
                "absolute",
                "flex-col",
                "gap-y-6",
                "z-10",
                "px-3",
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
                    onClickSend={transaction.openSendTokenModal}
                    onClickReceive={transaction.openReceiveTokenModal}
                    onClickReward={transaction.openCollectRewardsModal}
                    onClickReinvest={onReinvest}
                  />
                  <AddressBar
                    address={userInfo?.address ?? ""}
                    onDisconnect={wallet.disconnect}
                  />
                </div>
              )}
            </div>

            <main className={cn("block", "w-full")}>{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AppSideBar;
