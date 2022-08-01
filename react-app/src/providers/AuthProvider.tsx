import React, { useCallback, useMemo } from "react";
import { useAuthAPI } from "../api/authAPI";
import { useCosmosAPI } from "../api/cosmosAPI";
import Config from "../config/Config";
import { ConnectionStatus, useWallet } from "./WalletProvider";

const chainId = Config.chainInfo.chainId;

function makeSignInWithCosmosMessage(
  url: URL,
  address: string,
  nonce: string
): string {
  const now = new Date();
  return (
    `${url.host} wants you to sign in with your LikeCoin account:\n` +
    `${address}\n\n\n\n` +
    `URI: ${url.origin}\n` +
    `Version: 1\n` +
    `Chain ID: ${chainId}\n` +
    `Nonce: ${nonce}\n` +
    `Issued At: ${now.toISOString()}`
  );
}

interface AuthProviderProps {
  children?: React.ReactNode;
}

interface AuthContextValue {
  signInWithCosmos: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue>(null as any);

const AuthProvider: React.FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const wallet = useWallet();
  const authAPI = useAuthAPI();
  const cosmosAPI = useCosmosAPI();

  const signInWithCosmos = useCallback(async () => {
    if (wallet.status !== ConnectionStatus.Connected) {
      throw new Error("Wallet is not connected");
    }

    const nonce = await authAPI.getNonce();

    const signInMessage = makeSignInWithCosmosMessage(
      new URL(window.location.href),
      wallet.account.address,
      nonce
    );

    const { signed, signature } = await cosmosAPI.signArbitrary(signInMessage);

    await authAPI.verify(signed, signature);
  }, [wallet, authAPI, cosmosAPI]);

  const value = useMemo(
    () => ({
      signInWithCosmos,
    }),
    [signInWithCosmos]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = (): AuthContextValue => React.useContext(AuthContext);
