import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { AccountData } from "@cosmjs/proto-signing";
import { toast } from "react-toastify";
import { KeplrWallet } from "../clients/keplrClient";
import { BaseWallet } from "../clients/baseWallet";
import { WalletConnectWallet } from "../clients/walletConnectClient";
import ConnectWalletModal from "../components/ConnectWalletModal/ConnectWalletModal";
import Config from "../config/Config";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useWindowEvent } from "../hooks/useWindowEvent";
import { ExtendedQueryClient } from "../clients/queryClient";
import { useLocale } from "./AppLocaleProvider";

const AUTO_CONNECT_WALLET_TYPE_KEY = "LS/AutoConnectWalletType";

export enum ConnectionStatus {
  Idle = "idle",
  Connecting = "connecting",
  Connected = "connected",
}

export enum AutoConnectWalletType {
  Keplr = "keplr",
  // WalletConnect doesn't support auto reconnect
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
  provider: SigningStargateClient;
  query: ExtendedQueryClient;
  account: AccountData;
  refreshAccounts: () => Promise<void>;
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

  const [autoConnectWalletType, setAutoConnectWalletType] =
    useLocalStorage<string>(AUTO_CONNECT_WALLET_TYPE_KEY);

  const [isConnectWalletModalActive, setIsConnectWalletModalActive] =
    useState<boolean>(false);

  const [activeWallet, setActiveWallet] = useState<BaseWallet | null>(null);
  const [walletStatus, setWalletStatus] = useState<ConnectionStatus>(
    ConnectionStatus.Idle
  );
  const [account, setAccount] = useState<AccountData | null>(null);

  const openConnectWalletModal = useCallback(() => {
    setIsConnectWalletModalActive(true);
  }, [setIsConnectWalletModalActive]);

  const closeConnectWalletModal = useCallback(() => {
    setIsConnectWalletModalActive(false);
  }, [setIsConnectWalletModalActive]);

  const refreshAccounts = useCallback(async () => {
    if (!activeWallet || walletStatus !== ConnectionStatus.Connected) {
      return;
    }

    const [account] = await activeWallet.offlineSigner.getAccounts();

    setAccount(account);
  }, [activeWallet, walletStatus]);

  const disconnect = useCallback(() => {
    if (activeWallet) {
      activeWallet
        .disconnect()
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
  }, [activeWallet, setAutoConnectWalletType]);

  const connectToKeplr = useCallback(() => {
    setWalletStatus(ConnectionStatus.Connecting);
    closeConnectWalletModal();
    KeplrWallet.connect(chainInfo)
      .then(async (wallet: KeplrWallet) => {
        setActiveWallet(wallet);
        return wallet.offlineSigner.getAccounts();
      })
      .then((accounts: readonly AccountData[]) => {
        const [account] = accounts;
        setAccount(account);
        setAutoConnectWalletType(AutoConnectWalletType.Keplr);
        setWalletStatus(ConnectionStatus.Connected);
      })
      .catch((err) => {
        console.error("Failed to connect to Keplr = ", err);
        toast.error(translate("ConnectWallet.prompt.failed"));
        setWalletStatus(ConnectionStatus.Idle);
        setAutoConnectWalletType(null);
      });
  }, [chainInfo, setAutoConnectWalletType, translate, closeConnectWalletModal]);

  const connectToWalletConnect = useCallback(() => {
    setWalletStatus(ConnectionStatus.Connecting);
    closeConnectWalletModal();
    WalletConnectWallet.connect(chainInfo, {
      onDisconnect: disconnect,
    })
      .then(async (wallet: WalletConnectWallet) => {
        setActiveWallet(wallet);
        return wallet.offlineSigner.getAccounts();
      })
      .then((accounts: readonly AccountData[]) => {
        const [account] = accounts;
        setAccount(account);
        setWalletStatus(ConnectionStatus.Connected);
      })
      .catch((err) => {
        console.error("Failed to connect to WalletConnect = ", err);
        toast.error(translate("ConnectWallet.prompt.failed"));
        setWalletStatus(ConnectionStatus.Idle);
      });
  }, [chainInfo, translate, closeConnectWalletModal, disconnect]);

  useEffect(() => {
    if (!!activeWallet || walletStatus !== ConnectionStatus.Idle) return;
    switch (autoConnectWalletType) {
      case AutoConnectWalletType.Keplr:
        connectToKeplr();
        break;
      default:
        break;
    }
  }, [activeWallet, autoConnectWalletType, connectToKeplr, walletStatus]);

  // https://docs.keplr.app/api/#change-key-store-event
  useWindowEvent("keplr_keystorechange", () => {
    refreshAccounts().catch((e) => {
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
      query: activeWallet.query,
      account: account!,
      refreshAccounts,
      disconnect,
    };
  }, [
    account,
    activeWallet,
    walletStatus,
    openConnectWalletModal,
    refreshAccounts,
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
