import { useCallback, useMemo } from "react";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import { newWithdrawDelegatorRewardMessage } from "../models/cosmos/distribution";
import { SignedTx, useCosmos } from "./cosmosAPI";

interface IDistributionAPI {
  signWithdrawDelegationRewardsTx(memo?: string): Promise<SignedTx>;
}

export const useDistribution = (): IDistributionAPI => {
  const wallet = useWallet();
  const cosmos = useCosmos();
  const chainInfo = Config.chainInfo;

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
        r.reward.some((rr) => rr.denom === chainInfo.currency.coinMinimalDenom)
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
    [chainInfo, cosmos, wallet]
  );

  return useMemo(
    () => ({
      signWithdrawDelegationRewardsTx,
    }),
    [signWithdrawDelegationRewardsTx]
  );
};
