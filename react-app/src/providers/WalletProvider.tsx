import React, { useCallback, useMemo, useState } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { AccountData } from "@cosmjs/proto-signing";
import { toast } from "react-toastify";
import { KeplrWallet } from "../clients/keplrClient";
import { BaseWallet } from "../clients/baseWallet";
import { WalletConnectWallet } from "../clients/walletConnectClient";
import ConnectWalletModal from "../components/ConnectWalletModal/ConnectWalletModal";
import Config from "../config/Config";
import { useLocale } from "./AppLocaleProvider";

export enum ConnectionStatus {
  Idle = "idle",
  Connecting = "connecting",
  Connected = "connected",
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
        });
    }
  }, [activeWallet]);

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
        setWalletStatus(ConnectionStatus.Connected);
      })
      .catch((err) => {
        console.error("Failed to connect to Keplr = ", err);
        toast.error(translate("ConnectWallet.prompt.failed"));
        setWalletStatus(ConnectionStatus.Idle);
      });
  }, [chainInfo, translate, closeConnectWalletModal]);

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
