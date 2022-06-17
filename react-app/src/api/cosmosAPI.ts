import { useCallback, useMemo } from "react";
import { calculateFee, DeliverTxResponse } from "@cosmjs/stargate";
import { EncodeObject } from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import Config from "../config/Config";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import { convertMinimalTokenToToken } from "../utils/coin";
import { BigNumberCoin } from "../models/coin";
import { SignDataMessageResponse } from "../models/cosmos/tx";

export type SignedTx = Uint8Array;

// This is the value used by cosmJS
const GAS_ADJUSTMENT = 1.3;

interface ICosmosAPI {
  getBalance(): Promise<BigNumberCoin>;
  getStakedBalance(): Promise<BigNumberCoin>;
  signArbitrary(data: string): Promise<SignDataMessageResponse>;
  signTx(messages: EncodeObject[], memo?: string): Promise<SignedTx>;
  broadcastTx(tx: SignedTx): Promise<DeliverTxResponse>;
}

export const useCosmosAPI = (): ICosmosAPI => {
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

    const amount = convertMinimalTokenToToken(balance.amount);

    return {
      denom: balance.denom,
      amount,
    };
  }, [chainInfo.currency.coinMinimalDenom, wallet]);

  const getStakedBalance = useCallback(async () => {
    if (wallet.status !== ConnectionStatus.Connected) {
      throw new Error("Wallet not connected");
    }

    const balance = await wallet.provider.getBalanceStaked(
      wallet.account.address
    );

    if (!balance) {
      return {
        denom: chainInfo.currency.coinMinimalDenom,
        amount: convertMinimalTokenToToken(0),
      };
    }

    return {
      denom: balance.denom,
      amount: convertMinimalTokenToToken(balance.amount),
    };
  }, [chainInfo.currency.coinMinimalDenom, wallet]);

  const signTx = useCallback(
    async (messages: EncodeObject[], memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const { address } = wallet.account;
      const usedGas = await wallet.provider.simulate(address, messages, memo);

      const fee = calculateFee(
        Math.round(usedGas * GAS_ADJUSTMENT),
        chainInfo.gasPrice
      );

      const tx = await wallet.provider.sign(address, messages, fee, memo ?? "");

      return TxRaw.encode(tx).finish();
    },
    [chainInfo, wallet]
  );

  const broadcastTx = useCallback(
    async (tx: SignedTx) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      return wallet.provider.broadcastTx(tx);
    },
    [wallet]
  );

  const signArbitrary = useCallback(
    async (data: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const { address } = wallet.account;

      return wallet.provider.signArbitrary(address, data);
    },
    [wallet]
  );

  return useMemo(
    () => ({
      getBalance,
      getStakedBalance,
      signArbitrary,
      signTx,
      broadcastTx,
    }),
    [getBalance, getStakedBalance, signArbitrary, signTx, broadcastTx]
  );
};
