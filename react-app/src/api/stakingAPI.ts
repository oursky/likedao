import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import {
  newDelegateMessage,
  newUndelegateMessage,
} from "../models/cosmos/staking";
import { convertTokenToMinimalToken } from "../utils/coin";
import { SignedTx, useCosmos } from "./cosmosAPI";

interface IStakingAPI {
  signDelegateTokenTx(
    validator: string,
    amount: string,
    memo?: string
  ): Promise<SignedTx>;
  signUndelegateTokenTx(
    validator: string,
    amount: string,
    memo?: string
  ): Promise<SignedTx>;
}

export const useStaking = (): IStakingAPI => {
  const wallet = useWallet();
  const cosmos = useCosmos();
  const chainInfo = Config.chainInfo;

  const signDelegateTokenTx = useCallback(
    async (validator: string, amount: string, memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const coinAmount = convertTokenToMinimalToken(amount);

      const { address } = wallet.account;

      const balance = await cosmos.getBalance();
      const coinBalance = convertTokenToMinimalToken(balance.amount);

      if (coinBalance.isLessThan(coinAmount)) {
        throw new Error("Insufficient funds");
      }

      const request = newDelegateMessage({
        delegatorAddress: address,
        validatorAddress: validator,
        amount: {
          denom: chainInfo.currency.coinMinimalDenom,
          amount: coinAmount.toFixed(),
        },
      });

      return cosmos.signTx([request], memo);
    },
    [chainInfo, cosmos, wallet]
  );

  const signUndelegateTokenTx = useCallback(
    async (validator: string, amount: string, memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const withdrawalAmount = convertTokenToMinimalToken(amount);

      const { address } = wallet.account;

      const delegation = await wallet.query.staking.delegation(
        address,
        validator
      );

      if (!delegation.delegationResponse?.balance) {
        throw new Error("No delegation");
      }

      const delegationAmount = new BigNumber(
        delegation.delegationResponse.balance.amount
      );

      if (delegationAmount.isLessThan(withdrawalAmount)) {
        throw new Error("Withdraw amount is more than delegated amount");
      }

      const request = newUndelegateMessage({
        delegatorAddress: address,
        validatorAddress: validator,
        amount: {
          denom: chainInfo.currency.coinMinimalDenom,
          amount: withdrawalAmount.toFixed(),
        },
      });

      return cosmos.signTx([request], memo);
    },
    [chainInfo, cosmos, wallet]
  );

  return useMemo(
    () => ({
      signDelegateTokenTx,
      signUndelegateTokenTx,
    }),
    [signDelegateTokenTx, signUndelegateTokenTx]
  );
};
