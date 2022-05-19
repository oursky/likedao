import React, { useCallback, useMemo, useState } from "react";
import ConnectWalletModal from "../components/ConnectWalletModal/ConnectWalletModal";

interface WalletProviderProps {
  children?: React.ReactNode;
}

interface DisconnectedWalletContextValue {
  isConnected: false;
  openConnectWalletModal: () => void;
}
interface ConnectedWalletContextValue {
  isConnected: true;
}

type WalletContextValue =
  | DisconnectedWalletContextValue
  | ConnectedWalletContextValue;

const WalletContext = React.createContext<WalletContextValue>(null as any);

const WalletProvider: React.FC<WalletProviderProps> = (props) => {
  const { children } = props;

  const [isConnectWalletModalActive, setIsConnectWalletModalActive] =
    useState<boolean>(false);

  const openConnectWalletModal = useCallback(() => {
    setIsConnectWalletModalActive(true);
  }, [setIsConnectWalletModalActive]);

  const closeConnectWalletModal = useCallback(() => {
    setIsConnectWalletModalActive(false);
  }, [setIsConnectWalletModalActive]);

  const contextValue = useMemo(
    (): WalletContextValue => ({
      isConnected: false,
      openConnectWalletModal,
    }),
    [openConnectWalletModal]
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
      <ConnectWalletModal
        isOpened={isConnectWalletModalActive}
        onClose={closeConnectWalletModal}
      />
    </WalletContext.Provider>
  );
};

export default WalletProvider;

export const useWallet = (): WalletContextValue =>
  React.useContext(WalletContext);
