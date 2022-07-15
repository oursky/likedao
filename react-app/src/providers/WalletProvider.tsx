import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AccountData } from "@cosmjs/proto-signing";
import { toast } from "react-toastify";
import { KeplrWallet } from "../clients/keplrClient";
import {
  BaseWallet,
  WalletProvider as IWalletProvider,
} from "../clients/baseWallet";
import { WalletConnectWallet } from "../clients/walletConnectClient";
import ConnectWalletModal from "../components/ConnectWalletModal/ConnectWalletModal";
import Config from "../config/Config";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useWindowEvent } from "../hooks/useWindowEvent";
import { useAuthAPI } from "../api/authAPI";
import { BigNumberCoin } from "../models/coin";
import { convertMinimalTokenToToken } from "../utils/coin";
import { useLocale } from "./AppLocaleProvider";

const AUTO_CONNECT_WALLET_TYPE_KEY = "LS/AutoConnectWalletType";

export enum ConnectionStatus {
  Idle = "idle",
  Connecting = "connecting",
  Connected = "connected",
}

export enum AutoConnectWalletType {
  Keplr = "keplr",
  WalletConnect = "walletConnect",
}

interface WalletProviderProps {
  children?: React.ReactNode;
}

interface ConnectingWalletContextValue {
  status: ConnectionStatus.Connecting;
  openConnectWalletModal: undefined;
}

interface DisconnectedWalletContextValue {
  status: ConnectionStatus.Idle;
  openConnectWalletModal: () => void;
}
interface ConnectedWalletContextValue {
  status: ConnectionStatus.Connected;
  provider: IWalletProvider;
  account: AccountData;
  accountBalance: BigNumberCoin;
  refreshAccount: () => Promise<void>;
  disconnect: () => void;
}

type WalletContextValue =
  | DisconnectedWalletContextValue
  | ConnectedWalletContextValue
  | ConnectingWalletContextValue;

const WalletContext = React.createContext<WalletContextValue>(null as any);

const WalletProvider: React.FC<WalletProviderProps> = (props) => {
  const { children } = props;
  const { translate } = useLocale();
  const chainInfo = Config.chainInfo;
  const authAPI = useAuthAPI();

  const [autoConnectWalletType, setAutoConnectWalletType] =
    useLocalStorage<string>(AUTO_CONNECT_WALLET_TYPE_KEY);

  const [isConnectWalletModalActive, setIsConnectWalletModalActive] =
    useState<boolean>(false);

  const [activeWallet, setActiveWallet] = useState<BaseWallet | null>(null);
  const [walletStatus, setWalletStatus] = useState<ConnectionStatus>(
    ConnectionStatus.Idle
  );
  const [account, setAccount] = useState<AccountData | null>(null);
  const [accountBalance, setAccountBalance] = useState<BigNumberCoin | null>(
    null
  );

  const openConnectWalletModal = useCallback(() => {
    setIsConnectWalletModalActive(true);
  }, [setIsConnectWalletModalActive]);

  const closeConnectWalletModal = useCallback(() => {
    setIsConnectWalletModalActive(false);
  }, [setIsConnectWalletModalActive]);

  const refreshAccount = useCallback(async () => {
    if (!activeWallet || walletStatus !== ConnectionStatus.Connected) {
      return;
    }

    const [account] = await activeWallet.offlineSigner.getAccounts();

    const balance = await activeWallet.provider.getBalance(
      account.address,
      Config.chainInfo.currency.coinMinimalDenom
    );

    const accountBalance = {
      denom: balance.denom,
      amount: convertMinimalTokenToToken(balance.amount),
    };

    setAccount(account);
    setAccountBalance(accountBalance);
  }, [activeWallet, walletStatus]);

  const disconnect = useCallback(() => {
    if (activeWallet) {
      Promise.all([authAPI.logout(), activeWallet.disconnect()])
        .catch((err) => {
          console.error(
            "Failed to disconnect wallet, discarding anyway = ",
            err
          );
        })
        .finally(() => {
          setActiveWallet(null);
          setAutoConnectWalletType(null);
        });
    }
  }, [authAPI, activeWallet, setAutoConnectWalletType]);

  const connectToKeplr = useCallback(async () => {
    setWalletStatus(ConnectionStatus.Connecting);
    closeConnectWalletModal();

    try {
      const wallet = await KeplrWallet.connect(chainInfo);

      const [account] = await wallet.offlineSigner.getAccounts();

      const balance = await wallet.provider.getBalance(
        account.address,
        Config.chainInfo.currency.coinMinimalDenom
      );

      const accountBalance = {
        denom: balance.denom,
        amount: convertMinimalTokenToToken(balance.amount),
      };

      setActiveWallet(wallet);
      setAccount(account);
      setAccountBalance(accountBalance);
      setAutoConnectWalletType(AutoConnectWalletType.Keplr);
      setWalletStatus(ConnectionStatus.Connected);
      // Logout anyway to prevent the case where the logged in wallet has a different account than the authenticated address
      await authAPI.logout();
    } catch (err: unknown) {
      console.error("Failed to connect to Keplr = ", err);
      toast.error(translate("ConnectWallet.prompt.failed"));
      setWalletStatus(ConnectionStatus.Idle);
      setAutoConnectWalletType(null);
    }
  }, [
    authAPI,
    chainInfo,
    setAutoConnectWalletType,
    translate,
    closeConnectWalletModal,
  ]);

  const connectToWalletConnect = useCallback(async () => {
    setWalletStatus(ConnectionStatus.Connecting);
    closeConnectWalletModal();

    try {
      const wallet = await WalletConnectWallet.connect(chainInfo, {
        onDisconnect: disconnect,
      });

      const [account] = await wallet.offlineSigner.getAccounts();

      const balance = await wallet.provider.getBalance(
        account.address,
        Config.chainInfo.currency.coinMinimalDenom
      );

      const accountBalance = {
        denom: balance.denom,
        amount: convertMinimalTokenToToken(balance.amount),
      };

      setActiveWallet(wallet);
      setAccount(account);
      setAccountBalance(accountBalance);
      setAutoConnectWalletType(AutoConnectWalletType.WalletConnect);
      setWalletStatus(ConnectionStatus.Connected);
      // Logout anyway to prevent the case where the logged in wallet has a different account than the authenticated address
      await authAPI.logout();
    } catch (err: unknown) {
      console.error("Failed to connect to WalletConnect = ", err);
      toast.error(translate("ConnectWallet.prompt.failed"));
      setWalletStatus(ConnectionStatus.Idle);
    }
  }, [
    authAPI,
    chainInfo,
    translate,
    closeConnectWalletModal,
    setAutoConnectWalletType,
    disconnect,
  ]);

  useEffect(() => {
    if (activeWallet !== null || walletStatus !== ConnectionStatus.Idle) return;
    switch (autoConnectWalletType) {
      case AutoConnectWalletType.Keplr:
        // Error handled by function
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        connectToKeplr();
        break;
      case AutoConnectWalletType.WalletConnect:
        // Error handled by function
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        connectToWalletConnect();
        break;
      default:
        break;
    }
  }, [
    activeWallet,
    autoConnectWalletType,
    connectToKeplr,
    connectToWalletConnect,
    walletStatus,
  ]);

  // https://docs.keplr.app/api/#change-key-store-event
  useWindowEvent("keplr_keystorechange", () => {
    // Unauthenticating as the selected account is now changed
    Promise.all([authAPI.logout(), refreshAccount()]).catch((e) => {
      console.error("Failed to refresh accounts = ", e);
    });
  });

  const contextValue = useMemo((): WalletContextValue => {
    if (walletStatus === ConnectionStatus.Connecting) {
      return {
        status: ConnectionStatus.Connecting,
        openConnectWalletModal: undefined,
      };
    }

    if (!activeWallet || walletStatus === ConnectionStatus.Idle) {
      return {
        status: ConnectionStatus.Idle,
        openConnectWalletModal,
      };
    }

    return {
      status: walletStatus,
      provider: activeWallet.provider,
      account: account!,
      accountBalance: accountBalance!,
      refreshAccount,
      disconnect,
    };
  }, [
    account,
    activeWallet,
    walletStatus,
    accountBalance,
    openConnectWalletModal,
    refreshAccount,
    disconnect,
  ]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
      <ConnectWalletModal
        isOpened={isConnectWalletModalActive}
        onClose={closeConnectWalletModal}
        onKeplrConnect={connectToKeplr}
        onWalletConnectConnect={connectToWalletConnect}
      />
    </WalletContext.Provider>
  );
};

export default WalletProvider;

export const useWallet = (): WalletContextValue =>
  React.useContext(WalletContext);
