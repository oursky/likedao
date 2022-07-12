import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { newSendMessage } from "../models/cosmos/bank";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import {
  convertMinimalTokenToToken,
  convertTokenToMinimalToken,
} from "../utils/coin";
import Config from "../config/Config";
import { BigNumberCoin } from "../models/coin";
import { useQueryClient } from "../providers/QueryClientProvider";
import { SignedTx, useCosmosAPI } from "./cosmosAPI";

interface IBankAPI {
  getBalance(): Promise<BigNumberCoin>;
  getAddressBalance(address: string): Promise<BigNumberCoin>;
  getTotalSupply(): Promise<BigNumberCoin>;
  signSendTokenTx(
    recipent: string,
    amount: string,
    memo?: string
  ): Promise<SignedTx>;
}

const CoinDenom = Config.chainInfo.currency.coinDenom;
const CoinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;

export const useBankAPI = (): IBankAPI => {
  const wallet = useWallet();
  const cosmos = useCosmosAPI();
  const { query } = useQueryClient();

  const getBalance = useCallback(async () => {
    if (wallet.status !== ConnectionStatus.Connected) {
      throw new Error("Wallet not connected");
    }

    const balance = await wallet.provider.getBalance(
      wallet.account.address,
      CoinMinimalDenom
    );

    const amount = convertMinimalTokenToToken(balance.amount);

    return {
      denom: CoinDenom,
      amount,
    };
  }, [wallet]);

  const getAddressBalance = useCallback(
    async (address: string) => {
      const balance = await query.bank.balance(address, CoinMinimalDenom);

      return {
        denom: CoinDenom,
        amount: convertMinimalTokenToToken(balance.amount),
      };
    },
    [query.bank]
  );

  const getTotalSupply = useCallback(async () => {
    const supplyAllDenom = await query.bank.totalSupply();
    const supply = supplyAllDenom.find((c) => c.denom === CoinMinimalDenom);
    return {
      amount: new BigNumber(supply?.amount ?? 0),
      denom: CoinMinimalDenom,
    };
  }, [query.bank]);

  const signSendTokenTx = useCallback(
    async (recipent: string, amount: string, memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const coinAmount = convertTokenToMinimalToken(amount);

      const { address } = wallet.account;

      const balance = await getBalance();
      const coinBalance = convertTokenToMinimalToken(balance.amount);

      if (coinBalance.isLessThan(coinAmount)) {
        throw new Error("Insufficient funds");
      }

      const request = newSendMessage({
        fromAddress: address,
        toAddress: recipent,
        amount: [
          {
            denom: CoinMinimalDenom,
            amount: coinAmount.toFixed(),
          },
        ],
      });

      return cosmos.signTx([request], memo);
    },
    [cosmos, getBalance, wallet]
  );

  return useMemo(
    () => ({
      getBalance,
      getAddressBalance,
      getTotalSupply,
      signSendTokenTx,
    }),
    [getAddressBalance, getBalance, getTotalSupply, signSendTokenTx]
  );
};
