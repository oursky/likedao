import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { QueryDelegationRewardsResponse } from "cosmjs-types/cosmos/distribution/v1beta1/query";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import {
  DistributionParam,
  newWithdrawDelegatorRewardMessage,
} from "../models/cosmos/distribution";
import { useQueryClient } from "../providers/QueryClientProvider";
import { convertMinimalTokenToToken } from "../utils/coin";
import { BigNumberCoin } from "../models/coin";
import { translateAddress } from "../utils/address";
import { SignedTx, useCosmosAPI } from "./cosmosAPI";
import { useStakingAPI } from "./stakingAPI";
import { useBankAPI } from "./bankAPI";

interface IDistributionAPI {
  signWithdrawDelegationRewardsTx(memo?: string): Promise<SignedTx>;
  getTotalDelegationRewards(): Promise<BigNumberCoin>;
  getTotalDelegationRewards(): Promise<BigNumberCoin>;
  getTotalCommission(): Promise<BigNumberCoin>;
  getAddressTotalDelegationRewards(address: string): Promise<BigNumberCoin>;
  getAddressTotalCommission(address: string): Promise<BigNumberCoin>;
  getDelegationRewardsByValidator(
    delegatorAddress: string,
    validatorAddress: string
  ): Promise<BigNumberCoin | null>;
  getDelegationRewardsByValidators(
    delegatorAddress: string,
    validatorAddresses: string[]
  ): Promise<BigNumberCoin[]>;
  getParams(): Promise<DistributionParam>;
  getAPR(): Promise<number>;
  getValidatorExpectedReturn(address: string): Promise<number>;
  getBatchValidatorExpectedReturn(addresses: string[]): Promise<number[]>;
}

const CoinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;
const CoinDenom = Config.chainInfo.currency.coinDenom;
const Bech32PrefixValAddr = Config.chainInfo.bech32Config.bech32PrefixValAddr;

export const useDistributionAPI = (): IDistributionAPI => {
  const wallet = useWallet();
  const cosmosAPI = useCosmosAPI();
  const bankAPI = useBankAPI();
  const stakingAPI = useStakingAPI();
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

      return cosmosAPI.signTx(requests, memo);
    },
    [cosmosAPI, query, wallet]
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

  const getDelegationRewardsByValidator = useCallback(
    async (delegatorAddress: string, validatorAddress: string) => {
      try {
        const rewardRespond = await query.distribution.delegationRewards(
          delegatorAddress,
          validatorAddress
        );

        const reward = rewardRespond.rewards.find(
          (r) => r.denom === CoinMinimalDenom
        );
        // Default cosmos decimal places is 18
        const rewardAmount = new BigNumber(reward?.amount ?? 0).shiftedBy(-18);
        return {
          denom: CoinDenom,
          amount: convertMinimalTokenToToken(rewardAmount),
        };
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.message.includes("delegation does not exist")
        ) {
          return null;
        }
        throw err;
      }
    },
    [query]
  );

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

  const getParams = useCallback(async () => {
    const paramsRes = await query.distribution.params();
    if (!paramsRes.params) {
      throw new Error("Failed to fetch distribution parameters");
    }

    // Default cosmos decimal places is 18
    return {
      communityTax: new BigNumber(paramsRes.params.communityTax)
        .shiftedBy(-18)
        .toNumber(),
      baseProposerReward: new BigNumber(paramsRes.params.baseProposerReward)
        .shiftedBy(-18)
        .toNumber(),
      bonusProposerReward: new BigNumber(paramsRes.params.bonusProposerReward)
        .shiftedBy(-18)
        .toNumber(),
      withdrawAddrEnabled: paramsRes.params.withdrawAddrEnabled,
    };
  }, [query.distribution]);

  const getAPR = useCallback(async () => {
    const [params, inflation, pool, totalSupply] = await Promise.all([
      getParams(),
      query.mint.inflation(),
      stakingAPI.getPool(),
      bankAPI.getTotalSupply(),
    ]);

    const apr = totalSupply.amount
      .times(1 - params.communityTax)
      .times(inflation.toString())
      .div(pool.bondedTokens)
      .toNumber();
    return apr;
  }, [bankAPI, getParams, query.mint, stakingAPI]);

  /**
   * Expected return for delegators if they stake this validator
   * takes validator operator address as input argument
   * ref https://github.com/likecoin/lunie-ng/blob/60dbf7e18ceba41f4ebce304c23fa628a579c387/apis/cosmos-reducers.js#L689-L692
   */
  const getValidatorExpectedReturn = useCallback(
    async (address: string) => {
      const [annualProvisions, pool, validator] = await Promise.all([
        query.mint.annualProvisions(),
        stakingAPI.getPool(),
        stakingAPI.getValidator(address),
      ]);

      const pctCommission = new BigNumber(1).minus(
        validator.commission.commissionRates.rate
      );

      const provision = new BigNumber(annualProvisions.toString());
      const bonded = new BigNumber(pool.bondedTokens);
      const expectedRewards = pctCommission.times(provision.div(bonded));

      return expectedRewards.toNumber();
    },
    [query.mint, stakingAPI]
  );

  const getBatchValidatorExpectedReturn = useCallback(
    async (addresses: string[]) => {
      const [annualProvisions, pool, validators] = await Promise.all([
        query.mint.annualProvisions(),
        stakingAPI.getPool(),
        stakingAPI.getValidators(addresses),
      ]);
      return validators.map((validator) => {
        const pctCommission = new BigNumber(1).minus(
          validator.commission.commissionRates.rate
        );
        const provision = new BigNumber(annualProvisions.toString());
        const bonded = new BigNumber(pool.bondedTokens);
        const expectedRewards = pctCommission.times(provision.div(bonded));

        return expectedRewards.toNumber();
      });
    },
    [query.mint, stakingAPI]
  );

  return useMemo(
    () => ({
      signWithdrawDelegationRewardsTx,
      getTotalDelegationRewards,
      getTotalCommission,
      getAddressTotalDelegationRewards,
      getAddressTotalCommission,
      getDelegationRewardsByValidator,
      getDelegationRewardsByValidators,
      getParams,
      getAPR,
      getValidatorExpectedReturn,
      getBatchValidatorExpectedReturn,
    }),
    [
      signWithdrawDelegationRewardsTx,
      getTotalDelegationRewards,
      getTotalCommission,
      getAddressTotalDelegationRewards,
      getAddressTotalCommission,
      getDelegationRewardsByValidator,
      getDelegationRewardsByValidators,
      getParams,
      getAPR,
      getValidatorExpectedReturn,
      getBatchValidatorExpectedReturn,
    ]
  );
};
