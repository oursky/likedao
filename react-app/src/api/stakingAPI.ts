import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import {
  Delegation,
  DelegationResponse,
} from "cosmjs-types/cosmos/staking/v1beta1/staking";
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
} from "../utils/coin";
import { useQueryClient } from "../providers/QueryClientProvider";
import { BigNumberCoin } from "../models/coin";
import { SignedTx, useCosmosAPI } from "./cosmosAPI";
import { useBankAPI } from "./bankAPI";

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
  getStakedBalance(): Promise<BigNumberCoin>;
  getAddressStakedBalance(address: string): Promise<BigNumberCoin>;
  getUnstakingAmount(account: string): Promise<BigNumberCoin>;
  getDelegatorStakes(
    account: string
  ): Promise<{ delegation: Delegation; balance: BigNumberCoin }[]>;
}

const CoinDenom = Config.chainInfo.currency.coinDenom;
const CoinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;

export const useStakingAPI = (): IStakingAPI => {
  const wallet = useWallet();
  const cosmos = useCosmosAPI();
  const bank = useBankAPI();
  const { query } = useQueryClient();

  const signDelegateTokenTx = useCallback(
    async (validator: string, amount: string, memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const coinAmount = convertTokenToMinimalToken(amount);

      const { address } = wallet.account;

      const balance = await bank.getBalance();
      const coinBalance = convertTokenToMinimalToken(balance.amount);

      if (coinBalance.isLessThan(coinAmount)) {
        throw new Error("Insufficient funds");
      }

      const request = newDelegateMessage({
        delegatorAddress: address,
        validatorAddress: validator,
        amount: {
          denom: CoinMinimalDenom,
          amount: coinAmount.toFixed(),
        },
      });

      return cosmos.signTx([request], memo);
    },
    [cosmos, bank, wallet]
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
          denom: CoinMinimalDenom,
          amount: withdrawalAmount.toFixed(),
        },
      });

      return cosmos.signTx([request], memo);
    },
    [query, cosmos, wallet]
  );

  const getStakedBalance = useCallback(async () => {
    if (wallet.status !== ConnectionStatus.Connected) {
      throw new Error("Wallet not connected");
    }

    const balance = await wallet.provider.getBalanceStaked(
      wallet.account.address
    );

    return {
      denom: CoinMinimalDenom,
      amount: convertMinimalTokenToToken(balance?.amount ?? 0),
    };
  }, [wallet]);

  const getAddressStakedBalance = useCallback(
    async (address: string) => {
      const allDelegations = [];
      let startAtKey: Uint8Array | undefined;
      do {
        const { delegationResponses, pagination } =
          await query.staking.delegatorDelegations(address, startAtKey);
        const loadedDelegations = delegationResponses;
        allDelegations.push(...loadedDelegations);
        startAtKey = pagination?.nextKey;
      } while (startAtKey?.length !== 0 && startAtKey !== undefined);

      const amount = allDelegations.reduce(
        (
          previousValue: BigNumber,
          currentValue: DelegationResponse
        ): BigNumber => {
          // Safe because field is set to non-nullable (https://github.com/cosmos/cosmos-sdk/blob/v0.45.3/proto/cosmos/staking/v1beta1/staking.proto#L295)
          assert(currentValue.balance);
          return BigNumber.sum(
            new BigNumber(currentValue.balance.amount),
            previousValue
          );
        },
        new BigNumber(0)
      );

      return {
        denom: CoinDenom,
        amount: convertMinimalTokenToToken(amount),
      };
    },
    [query.staking]
  );

  const getUnstakingAmount = useCallback(
    async (address: string) => {
      const allDelegations = [];
      let startAtKey: Uint8Array | undefined;
      do {
        const { unbondingResponses, pagination } =
          await query.staking.delegatorUnbondingDelegations(
            address,
            startAtKey
          );
        const loadedDelegations = unbondingResponses;
        allDelegations.push(...loadedDelegations);
        startAtKey = pagination?.nextKey;
      } while (startAtKey?.length !== 0 && startAtKey !== undefined);

      let amount = new BigNumber(0);
      allDelegations.forEach((unbondingDelegation) => {
        unbondingDelegation.entries.forEach((entry) => {
          amount = BigNumber.sum(new BigNumber(entry.balance), amount);
        });
      });

      return {
        denom: CoinDenom,
        amount: convertMinimalTokenToToken(amount),
      };
    },
    [query.staking]
  );

  const getDelegatorStakes = useCallback(
    async (address: string) => {
      const allDelegations = [];
      let startAtKey: Uint8Array | undefined;
      do {
        const { delegationResponses, pagination } =
          await query.staking.delegatorDelegations(address, startAtKey);
        allDelegations.push(...delegationResponses);
        startAtKey = pagination?.nextKey;
      } while (startAtKey?.length !== 0 && startAtKey !== undefined);

      return allDelegations.map((delegationRespond) => ({
        delegation: delegationRespond.delegation as Delegation,
        balance: {
          denom: CoinDenom,
          amount: convertMinimalTokenToToken(
            delegationRespond.balance?.amount ?? 0
          ),
        },
      }));
    },
    [query.staking]
  );

  return useMemo(
    () => ({
      signDelegateTokenTx,
      signUndelegateTokenTx,
      getStakedBalance,
      getAddressStakedBalance,
      getUnstakingAmount,
      getDelegatorStakes,
    }),
    [
      signDelegateTokenTx,
      signUndelegateTokenTx,
      getStakedBalance,
      getAddressStakedBalance,
      getUnstakingAmount,
      getDelegatorStakes,
    ]
  );
};
