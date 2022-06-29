import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { QueryDelegationRewardsResponse } from "cosmjs-types/cosmos/distribution/v1beta1/query";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import { newWithdrawDelegatorRewardMessage } from "../models/cosmos/distribution";
import { useQueryClient } from "../providers/QueryClientProvider";
import { convertMinimalTokenToToken } from "../utils/coin";
import { BigNumberCoin } from "../models/coin";
import { translateAddress } from "../utils/address";
import { SignedTx, useCosmosAPI } from "./cosmosAPI";

interface IDistributionAPI {
  signWithdrawDelegationRewardsTx(memo?: string): Promise<SignedTx>;
  getTotalDelegationRewards(): Promise<BigNumberCoin>;
  getTotalDelegationRewards(): Promise<BigNumberCoin>;
  getTotalCommission(): Promise<BigNumberCoin>;
  getAddressTotalDelegationRewards(address: string): Promise<BigNumberCoin>;
  getAddressTotalCommission(address: string): Promise<BigNumberCoin>;
  getDelegationRewardsByValidators(
    delegatorAddress: string,
    validatorAddresses: string[]
  ): Promise<BigNumberCoin[]>;
}

const CoinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;
const CoinDenom = Config.chainInfo.currency.coinDenom;
const Bech32PrefixValAddr = Config.chainInfo.bech32Config.bech32PrefixValAddr;

export const useDistributionAPI = (): IDistributionAPI => {
  const wallet = useWallet();
  const cosmos = useCosmosAPI();
  const { query } = useQueryClient();

  const signWithdrawDelegationRewardsTx = useCallback(
    async (memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const { address } = wallet.account;

      const rewards = await query.distribution.delegationTotalRewards(address);

      const relatedRewards = rewards.rewards.filter((r) =>
        r.reward.some((rr) => rr.denom === CoinMinimalDenom)
      );

      if (relatedRewards.length === 0) {
        throw new Error("No rewards to withdraw");
      }

      const requests = relatedRewards.map((r) =>
        newWithdrawDelegatorRewardMessage({
          delegatorAddress: address,
          validatorAddress: r.validatorAddress,
        })
      );

      return cosmos.signTx(requests, memo);
    },
    [cosmos, query, wallet]
  );

  const getTotalDelegationRewards = useCallback(async () => {
    if (wallet.status !== ConnectionStatus.Connected) {
      throw new Error("Wallet not connected");
    }

    const rewards = await query.distribution.delegationTotalRewards(
      wallet.account.address
    );

    const totalRewards = rewards.total.find(
      (r) => r.denom === CoinMinimalDenom
    );

    // Default cosmos decimal places is 18
    const rewardAmount = new BigNumber(totalRewards?.amount ?? 0).shiftedBy(
      -18
    );

    return {
      denom: CoinDenom,
      amount: convertMinimalTokenToToken(rewardAmount),
    };
  }, [wallet, query]);

  const getDelegationRewardsByValidators = useCallback(
    async (delegatorAddress: string, validatorAddresses: string[]) => {
      const rewardPromises: Promise<QueryDelegationRewardsResponse>[] = [];

      validatorAddresses.forEach((validatorAddress) =>
        rewardPromises.push(
          query.distribution.delegationRewards(
            delegatorAddress,
            validatorAddress
          )
        )
      );
      const rewards = await Promise.all(rewardPromises);
      return rewards.map((rewardRespond) => {
        const reward = rewardRespond.rewards.find(
          (r) => r.denom === CoinMinimalDenom
        );
        // Default cosmos decimal places is 18
        const rewardAmount = new BigNumber(reward?.amount ?? 0).shiftedBy(-18);
        return {
          denom: CoinDenom,
          amount: convertMinimalTokenToToken(rewardAmount),
        };
      });
    },
    [query]
  );

  const getTotalCommission = useCallback(async () => {
    if (wallet.status !== ConnectionStatus.Connected) {
      throw new Error("Wallet not connected");
    }

    const address = translateAddress(
      wallet.account.address,
      Bech32PrefixValAddr
    );
    const commission = (await query.distribution.validatorCommission(address))
      .commission;

    if (!commission) {
      return {
        denom: CoinDenom,
        amount: convertMinimalTokenToToken(0),
      };
    }

    const totalCommission = commission.commission.find(
      (r) => r.denom === CoinMinimalDenom
    );
    // Default cosmos decimal places is 18
    const commissionAmount = new BigNumber(
      totalCommission?.amount ?? 0
    ).shiftedBy(-18);

    return {
      denom: CoinDenom,
      amount: convertMinimalTokenToToken(commissionAmount),
    };
  }, [wallet, query]);

  const getAddressTotalDelegationRewards = useCallback(
    async (address: string) => {
      const rewards = await query.distribution.delegationTotalRewards(address);

      const totalRewards = rewards.total.find(
        (r) => r.denom === CoinMinimalDenom
      );

      // Default cosmos decimal places is 18
      const rewardAmount = new BigNumber(totalRewards?.amount ?? 0).shiftedBy(
        -18
      );

      return {
        denom: CoinDenom,
        amount: convertMinimalTokenToToken(rewardAmount),
      };
    },
    [query]
  );

  const getAddressTotalCommission = useCallback(
    async (address: string) => {
      const translatedAddress = translateAddress(address, Bech32PrefixValAddr);

      const commission = (
        await query.distribution.validatorCommission(translatedAddress)
      ).commission;

      if (!commission) {
        return {
          denom: CoinDenom,
          amount: convertMinimalTokenToToken(0),
        };
      }

      const totalCommission = commission.commission.find(
        (r) => r.denom === CoinMinimalDenom
      );
      // Default cosmos decimal places is 18
      const commissionAmount = new BigNumber(
        totalCommission?.amount ?? 0
      ).shiftedBy(-18);

      return {
        denom: CoinDenom,
        amount: convertMinimalTokenToToken(commissionAmount),
      };
    },
    [query]
  );

  return useMemo(
    () => ({
      signWithdrawDelegationRewardsTx,
      getTotalDelegationRewards,
      getTotalCommission,
      getAddressTotalDelegationRewards,
      getAddressTotalCommission,
      getDelegationRewardsByValidators,
    }),
    [
      signWithdrawDelegationRewardsTx,
      getTotalDelegationRewards,
      getTotalCommission,
      getAddressTotalDelegationRewards,
      getAddressTotalCommission,
      getDelegationRewardsByValidators,
    ]
  );
};
