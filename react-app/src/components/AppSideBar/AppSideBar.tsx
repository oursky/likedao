import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useTransaction } from "../../providers/TransactionProvider";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import { useLocale } from "../../providers/AppLocaleProvider";
import Config from "../../config/Config";
import { useBankAPI } from "../../api/bankAPI";
import { useChainHealthQuery } from "./AppSideBarAPI";
import { Header } from "./Header";
import { LoginPanel } from "./LoginPanel";
import { UserInfo, UserInfoPanel } from "./UserInfoPanel";
import { AddressBar } from "./AddressBar";

interface AppSideBarProps {
  children?: React.ReactNode;
  isMenuOpen: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
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

const AppSideBar: React.FC<AppSideBarProps> = ({
  children,
  isMenuOpen,
  onMenuClose,
  onMenuOpen,
}) => {
  const { translate } = useLocale();

  const wallet = useWallet();
  const bankAPI = useBankAPI();
  const transaction = useTransaction();

  const { requestState } = useChainHealthQuery();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const chainId = Config.chainInfo.chainId;

  const toggleMobileMenuMenu = useCallback(() => {
    if (isMenuOpen) {
      onMenuClose();
    } else {
      onMenuOpen();
    }
  }, [onMenuClose, isMenuOpen, onMenuOpen]);

  // TODO: Handle shortcuts
  const onReinvest = useCallback(() => {}, []);

  const [chainStatus, latestBlockHeight] = useMemo(() => {
    if (!isRequestStateLoaded(requestState)) {
      return [null, null];
    }

    return [requestState.data.chainStatus, requestState.data.latestHeight];
  }, [requestState]);

  useEffect(() => {
    if (wallet.status !== ConnectionStatus.Connected) return;
    bankAPI
      .getBalance()
      .then((balance) => {
        setUserInfo({ balance, address: wallet.account.address });
      })
      .catch((e) => {
        console.error("Failed to fetch user balance =", e);
      });
  }, [bankAPI, wallet]);

  useEffectOnce(
    () => {
      if (isRequestStateError(requestState)) {
        toast.error(
          translate("AppSideBar.requestState.error", {
            chainId,
          })
        );
      }
    },
    () =>
      isRequestStateError(requestState) || isRequestStateLoaded(requestState)
  );

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "gap-x-4",
        "gap-y-6",
        "justify-center",
        "sm:justify-start",
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
          isMenuOpen && cn("h-screen", "fixed", "top-0", "z-50", "bg-default")
        )}
      >
        <div className={cn("flex", "flex-row", "order-1", "sm:flex-col")}>
          <Header
            chainStatus={chainStatus}
            latestBlockHeight={latestBlockHeight}
          />
          <IconButton
            icon={isMenuOpen ? IconType.X : IconType.Menu}
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
                !isMenuOpen && "hidden"
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
                !isMenuOpen && "hidden"
              )}
              onDisconnect={wallet.disconnect}
            />
          </>
        )}

        <MenuPanel
          isMenuActive={isMenuOpen}
          className={
            wallet.status === ConnectionStatus.Connected ? "order-2" : "order-3"
          }
          closeMobileMenu={onMenuClose}
        />
      </div>
      <main className={cn("grow", "px-3", "min-w-0", "sm:px-0")}>
        {children}
      </main>
    </div>
  );
};

export default AppSideBar;
