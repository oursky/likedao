import { useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useCosmosAPI } from "../../api/cosmosAPI";
import { useQueryClient } from "../../providers/QueryClientProvider";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { translateAddress } from "../../utils/address";
import { useStakingAPI } from "../../api/stakingAPI";
import {
  RequestState,
  RequestStateError,
  RequestStateInitial,
  RequestStateLoaded,
  RequestStateLoading,
} from "../../models/RequestState";
import { useDistributionAPI } from "../../api/distributionAPI";
import { Portfolio } from "./PortfolioScreenModel";

type PortfolioRequestState = RequestState<Portfolio | null>;

export function usePortfolioQuery(): PortfolioRequestState {
  const [requestState, setRequestState] =
    useState<PortfolioRequestState>(RequestStateInitial);

  const wallet = useWallet();
  const cosmosAPI = useCosmosAPI();
  const staking = useStakingAPI();
  const distribution = useDistributionAPI();
  const { desmosQuery } = useQueryClient();

  const fetchPortfolio = useCallback(async () => {
    setRequestState(RequestStateLoading);
    if (wallet.status !== ConnectionStatus.Connected) {
      setRequestState(RequestStateError(new Error("Wallet not connected.")));
      return;
    }
    try {
      const [
        availableBalance,
        stakedBalance,
        unstakingBalance,
        commission,
        reward,
        profile,
      ] = await Promise.all([
        cosmosAPI.getBalance(),
        cosmosAPI.getStakedBalance(),
        staking.getUnstakingAmount(wallet.account.address),
        distribution.getTotalCommission(),
        distribution.getTotalDelegationRewards(),
        desmosQuery.getProfile(
          translateAddress(wallet.account.address, "desmos")
        ),
      ]);

      const balance = {
        amount: BigNumber.sum(
          availableBalance.amount,
          stakedBalance.amount,
          unstakingBalance.amount
        ),
        denom: availableBalance.denom,
      };

      setRequestState(
        RequestStateLoaded({
          profile,
          balance,
          stakedBalance,
          unstakingBalance,
          availableBalance,
          commission,
          reward,
          address: wallet.account.address,
        })
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRequestState(RequestStateError(err));
      }
      console.log("Failed to handle fetch portfolio error =", err);
    }
  }, [wallet, cosmosAPI, staking, desmosQuery, setRequestState, distribution]);

  useEffect(() => {
    fetchPortfolio().catch((err) => {
      setRequestState(RequestStateError(err));
    });
  }, [fetchPortfolio]);

  return requestState;
}
