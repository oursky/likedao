import { useCallback, useMemo } from "react";
import { Coin } from "@cosmjs/stargate";
import BigNumber from "bignumber.js";
import Config from "../config/Config";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";

export type ParsedCoin = Pick<Coin, "denom"> & { amount: BigNumber };

interface ICosmosAPI {
  getBalance(): Promise<ParsedCoin>;
}

export const useCosmos = (): ICosmosAPI => {
  const wallet = useWallet();
  const chainInfo = Config.chainInfo;

  const getBalance = useCallback(async () => {
    if (wallet.status !== ConnectionStatus.Connected) {
      throw new Error("Wallet not connected");
    }

    const balance = await wallet.provider.getBalance(
      wallet.account.address,
      chainInfo.currency.coinMinimalDenom
    );

    const amount = new BigNumber(balance.amount);

    return {
      denom: balance.denom,
      amount,
    };
  }, [chainInfo.currency.coinMinimalDenom, wallet]);

  return useMemo(
    () => ({
      getBalance,
    }),
    [getBalance]
  );
};
