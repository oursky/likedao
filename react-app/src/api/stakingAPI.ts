import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import {
  Delegation,
  DelegationResponse,
  Pool,
  Validator as RPCValidator,
} from "cosmjs-types/cosmos/staking/v1beta1/staking";
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
import { BigNumberDelegation } from "../models/staking";
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
  getDelegatorStakes(account: string): Promise<BigNumberDelegation[]>;
  getPool(): Promise<Pool>;
  getDelegation(
    delegatorAddress: string,
    validatorAddress: string
  ): Promise<BigNumberDelegation | null>;
  getValidator(address: string): Promise<RPCValidator>;
  getValidators(addresses: string[]): Promise<RPCValidator[]>;
}

const CoinDenom = Config.chainInfo.currency.coinDenom;
const CoinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;

export const useStakingAPI = (): IStakingAPI => {
  const wallet = useWallet();
  const cosmosAPI = useCosmosAPI();
  const bankAPI = useBankAPI();
  const { query } = useQueryClient();

  const signDelegateTokenTx = useCallback(
    async (validator: string, amount: string, memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const { address } = wallet.account;

      const balance = await bankAPI.getBalance();

      if (balance.amount.isLessThan(amount)) {
        throw new Error("Insufficient funds");
      }

      const request = newDelegateMessage({
        delegatorAddress: address,
        validatorAddress: validator,
        amount: {
          denom: CoinMinimalDenom,
          amount: convertTokenToMinimalToken(amount).toFixed(),
        },
      });

      return cosmosAPI.signTx([request], memo);
    },
    [cosmosAPI, bankAPI, wallet]
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

      return cosmosAPI.signTx([request], memo);
    },
    [query, cosmosAPI, wallet]
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
          if (!currentValue.balance) {
            throw new Error(
              `Failed to fetch delegation for ${address}'s staked balance`
            );
          }
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

  const getPool = useCallback(async () => {
    const poolRespond = await query.staking.pool();
    if (!poolRespond.pool) {
      throw new Error("Failed to fetch staking pool");
    }
    return poolRespond.pool;
  }, [query.staking]);

  const getDelegation = useCallback(
    async (delegatorAddress: string, validatorAddress: string) => {
      try {
        const queryDelegationRespond = await query.staking.delegation(
          delegatorAddress,
          validatorAddress
        );
        if (!queryDelegationRespond.delegationResponse) {
          return null;
        }

        const delegationResponse = queryDelegationRespond.delegationResponse;

        if (!delegationResponse.balance || !delegationResponse.delegation) {
          throw new Error("Failed to fetch delegation");
        }

        return {
          delegation: delegationResponse.delegation,
          balance: {
            amount: convertMinimalTokenToToken(
              delegationResponse.balance.amount
            ),
            denom: CoinDenom,
          },
        };
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("NotFound")) {
          return null;
        }
        throw err;
      }
    },
    [query.staking]
  );

  const getValidator = useCallback(
    async (address: string) => {
      const validatorResponse = await query.staking.validator(address);
      const validator = validatorResponse.validator;

      if (!validator) {
        throw new Error(`validator with address ${address} not found`);
      }

      return validator;
    },
    [query.staking]
  );

  const getValidators = useCallback(
    async (addresses: string[]) => {
      const validatorPromises: Promise<RPCValidator>[] = [];
      for (const address of addresses) {
        validatorPromises.push(getValidator(address));
      }
      const validators = await Promise.all(validatorPromises);
      return validators;
    },
    [getValidator]
  );

  return useMemo(
    () => ({
      signDelegateTokenTx,
      signUndelegateTokenTx,
      getStakedBalance,
      getAddressStakedBalance,
      getUnstakingAmount,
      getDelegatorStakes,
      getPool,
      getDelegation,
      getValidator,
      getValidators,
    }),
    [
      signDelegateTokenTx,
      signUndelegateTokenTx,
      getStakedBalance,
      getAddressStakedBalance,
      getUnstakingAmount,
      getDelegatorStakes,
      getPool,
      getDelegation,
      getValidator,
      getValidators,
    ]
  );
};
