import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { DelegationResponse } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { assert } from "@cosmjs/utils";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import {
  newDelegateMessage,
  newUndelegateMessage,
} from "../models/cosmos/staking";
import {
  convertMinimalTokenToToken,
  convertTokenToMinimalToken,
  addCoins,
} from "../utils/coin";
import { useQueryClient } from "../providers/QueryClientProvider";
import { BigNumberCoin } from "../models/coin";
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
  getBalanceStaked(account: string): Promise<BigNumberCoin>;
  getUnstakingAmount(account: string): Promise<BigNumberCoin>;
}

export const useStaking = (): IStakingAPI => {
  const wallet = useWallet();
  const cosmos = useCosmos();
  const { query } = useQueryClient();
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

      const delegation = await query.staking.delegation(address, validator);

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
    [chainInfo, query, cosmos, wallet]
  );

  /**
   * TODO: Remove and use getter on stargate client instead upon upgrading cosmjs/* to v0.48 or above
   * Source: https://github.com/cosmos/cosmjs/commit/35a99fa44fb7dad45c6e529fbd9356baa4cb3a5f#diff-85b6fde6b221072d41a75679ef8130231d58d723738d773a30a08ce21ddc0a2b
   */
  const getBalanceStaked = useCallback(
    async (address: string) => {
      const allDelegations = [];
      let startAtKey: Uint8Array | undefined;
      while (startAtKey?.length !== 0 && startAtKey !== undefined) {
        const { delegationResponses, pagination } =
          await query.staking.delegatorDelegations(address, startAtKey);

        const loadedDelegations = delegationResponses;
        allDelegations.push(...loadedDelegations);
        startAtKey = pagination?.nextKey;
      }

      const sumValues = allDelegations.reduce(
        (
          previousValue: Coin | null,
          currentValue: DelegationResponse
        ): Coin => {
          assert(currentValue.balance);
          return previousValue !== null
            ? addCoins(previousValue, currentValue.balance)
            : currentValue.balance;
        },
        null
      );
      return {
        denom: sumValues
          ? sumValues.denom
          : chainInfo.currency.coinMinimalDenom,
        amount: convertMinimalTokenToToken(sumValues ? sumValues.amount : 0),
      };
    },
    [query.staking, chainInfo]
  );

  const getUnstakingAmount = useCallback(
    async (address: string) => {
      const allDelegations = [];
      let startAtKey: Uint8Array | undefined;
      while (startAtKey?.length !== 0 && startAtKey !== undefined) {
        const { unbondingResponses, pagination } =
          await query.staking.delegatorUnbondingDelegations(
            address,
            startAtKey
          );

        const loadedDelegations = unbondingResponses;
        allDelegations.push(...loadedDelegations);
        startAtKey = pagination?.nextKey;
      }

      let amount = new BigNumber(0);
      allDelegations.forEach((unbondingDelegation) => {
        unbondingDelegation.entries.forEach((entry) => {
          amount = BigNumber.sum(
            convertMinimalTokenToToken(entry.balance),
            amount
          );
        });
      });

      return {
        denom: chainInfo.currency.coinMinimalDenom,
        amount: convertMinimalTokenToToken(amount),
      };
    },
    [chainInfo.currency.coinMinimalDenom, query.staking]
  );

  return useMemo(
    () => ({
      signDelegateTokenTx,
      signUndelegateTokenTx,
      getBalanceStaked,
      getUnstakingAmount,
    }),
    [
      signDelegateTokenTx,
      signUndelegateTokenTx,
      getBalanceStaked,
      getUnstakingAmount,
    ]
  );
};
