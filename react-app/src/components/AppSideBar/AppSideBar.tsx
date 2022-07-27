import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import { useLocation, useMatch } from "react-router-dom";
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
import { CommunityStatusHeader } from "../CommunityStatus/CommunityStatusHeader";
import AppRoutes from "../../navigation/AppRoutes";
import {
  useChainHealthQuery,
  useAppSideBarCommunityStatusQuery,
} from "./AppSideBarAPI";
import { Header } from "./Header";
import { LoginPanel } from "./LoginPanel";
import { UserInfoPanel } from "./UserInfoPanel";
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
        "desktop:flex",
        "flex-col",
        className
      )}
    >
      <Divider className={cn("hidden", "desktop:block")} />
      <AppNavigationMenu
        activeRoute={location.pathname}
        className={cn("py-6")}
        onMenuItemSelect={closeMobileMenu}
      />
    </div>
  );
};

// eslint-disable-next-line complexity
const AppSideBar: React.FC<AppSideBarProps> = ({
  children,
  isMenuOpen,
  onMenuClose,
  onMenuOpen,
}) => {
  const { translate } = useLocale();
  const hideCommunityStatusHeader = useMatch(AppRoutes.Overview);

  const wallet = useWallet();
  const transaction = useTransaction();

  const { requestState } = useChainHealthQuery();
  const communityStatusRequestState = useAppSideBarCommunityStatusQuery();

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

  const userInfo = useMemo(() => {
    if (wallet.status !== ConnectionStatus.Connected) return null;

    return {
      address: wallet.account.address,
      balance: wallet.accountBalance,
    };
  }, [wallet]);

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
        "desktop:justify-start",
        "desktop:gap-y-4",
        "desktop:flex-row",
        "relative",
        "desktop:w-full",
        "w-screen"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0",
          "flex",
          "flex-col",
          "px-3",
          "pt-3",
          "desktop:p-0",
          "desktop:w-72",
          "w-screen",
          "desktop:static",
          "desktop:bg-transparent",
          isMenuOpen && cn("h-screen", "fixed", "top-0", "z-50", "bg-default")
        )}
      >
        <div className={cn("flex", "flex-row", "order-1", "desktop:flex-col")}>
          <Header
            chainStatus={chainStatus}
            latestBlockHeight={latestBlockHeight}
          />
          <IconButton
            icon={isMenuOpen ? IconType.X : IconType.Menu}
            size={24}
            className={cn("desktop:hidden")}
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
                "desktop:flex",
                !isMenuOpen && "hidden"
              )}
            >
              <Divider />
              <UserInfoPanel
                className={cn("mt-6", "desktop:mt-0")}
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
                "desktop:order-2",
                "desktop:flex",
                "desktop:items-center",
                "mt-5",
                "desktop:mt-0",
                "desktop:mb-7",
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
      <div className={cn("grow", "px-3", "min-w-0", "desktop:px-0")}>
        {!hideCommunityStatusHeader && (
          <div className="flex justify-end mb-6">
            <CommunityStatusHeader
              className="hidden desktop:flex"
              isLoading={!isRequestStateLoaded(communityStatusRequestState)}
              communityStatus={
                isRequestStateLoaded(communityStatusRequestState)
                  ? communityStatusRequestState.data
                  : null
              }
            />
          </div>
        )}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default AppSideBar;
