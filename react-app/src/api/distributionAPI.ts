import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import { newWithdrawDelegatorRewardMessage } from "../models/cosmos/distribution";
import { convertMinimalTokenToToken } from "../utils/coin";
import { BigNumberCoin } from "../models/coin";
import { SignedTx, useCosmos } from "./cosmosAPI";

interface IDistributionAPI {
  signWithdrawDelegationRewardsTx(memo?: string): Promise<SignedTx>;
  getTotalDelegationRewards(): Promise<BigNumberCoin>;
}

export const useDistribution = (): IDistributionAPI => {
  const wallet = useWallet();
  const cosmos = useCosmos();
  const coinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;

  const signWithdrawDelegationRewardsTx = useCallback(
    async (memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const { address } = wallet.account;

      const rewards = await wallet.query.distribution.delegationTotalRewards(
        address
      );

      const relatedRewards = rewards.rewards.filter((r) =>
        r.reward.some((rr) => rr.denom === coinMinimalDenom)
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
    [coinMinimalDenom, cosmos, wallet]
  );

  const getTotalDelegationRewards = useCallback(async () => {
    if (wallet.status !== ConnectionStatus.Connected) {
      throw new Error("Wallet not connected");
    }
    const rewards = await wallet.query.distribution.delegationTotalRewards(
      wallet.account.address
    );

    const totalRewards = rewards.total.find(
      (r) => r.denom === coinMinimalDenom
    );

    // Default cosmos decimal places is 18
    const rewardAmount = new BigNumber(totalRewards?.amount ?? 0).shiftedBy(
      -18
    );

    return {
      denom: coinMinimalDenom,
      amount: convertMinimalTokenToToken(rewardAmount),
    };
  }, [coinMinimalDenom, wallet]);

  return useMemo(
    () => ({
      signWithdrawDelegationRewardsTx,
      getTotalDelegationRewards,
    }),
    [signWithdrawDelegationRewardsTx, getTotalDelegationRewards]
  );
};
