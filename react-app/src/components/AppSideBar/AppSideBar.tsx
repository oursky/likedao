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
import { useChainHealthQuery } from "./AppSideBarAPI";
import { Header } from "./Header";
import { LoginPanel } from "./LoginPanel";
import { UserInfo, UserInfoPanel } from "./UserInfoPanel";
import { AddressBar } from "./AddressBar";

interface AppSideBarProps {
  children?: React.ReactNode;
}

const MenuPanel: React.FC<{
  isMenuActive: boolean;
  className?: string;
  closeMobileMenu: () => void;
}> = ({ isMenuActive, closeMobileMenu, className }) => {
  const location = useLocation();
  return (
    <div
      className={cn(
        !isMenuActive && "hidden",
        "sm:flex",
        "flex-col",
        className
      )}
    >
      <Divider className={cn("hidden", "sm:block")} />
      <AppNavigationMenu
        activeRoute={location.pathname}
        className={cn("py-6")}
        onMenuItemSelect={closeMobileMenu}
      />
    </div>
  );
};

const AppSideBar: React.FC<AppSideBarProps> = (props) => {
  const { children } = props;
  const { translate } = useLocale();

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
        "gap-x-4",
        "gap-y-6",
        "justify-center",
        "sm:gap-y-4",
        "sm:flex-row",
        "relative",
        "sm:w-full",
        "w-screen"
      )}
    >
      <div
        className={cn(
          "flex",
          "flex-col",
          "px-3",
          "pt-3",
          "sm:p-0",
          "sm:w-72",
          "w-screen",
          "sm:static",
          "sm:bg-transparent",
          isMenuActive && cn("h-screen", "fixed", "top-0", "z-50", "bg-default")
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
          <>
            <div
              className={cn(
                "order-3",
                "flex-col",
                "gap-y-6",
                "sm:flex",
                !isMenuActive && "hidden"
              )}
            >
              <Divider />
              <UserInfoPanel
                className={cn("mt-6", "sm:mt-0")}
                userInfo={userInfo}
                onClickSend={transaction.openSendTokenModal}
                onClickReceive={transaction.openReceiveTokenModal}
                onClickReward={transaction.openCollectRewardsModal}
                onClickReinvest={onReinvest}
              />
            </div>
            <AddressBar
              address={userInfo?.address ?? ""}
              className={cn(
                "order-4",
                "sm:order-2",
                "sm:flex",
                "sm:items-center",
                "mt-5",
                "sm:mt-0",
                "sm:mb-7",
                !isMenuActive && "hidden"
              )}
              onDisconnect={wallet.disconnect}
            />
          </>
        )}

        <MenuPanel
          isMenuActive={isMenuActive}
          className={
            wallet.status === ConnectionStatus.Connected ? "order-2" : "order-3"
          }
          closeMobileMenu={closeMobileMenu}
        />
      </div>
      <main className={cn("grow", "px-3", "sm:px-0")}>{children}</main>
    </div>
  );
};

export default AppSideBar;
