import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "bignumber.js";
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

export function usePortfolioQuery(address?: string): PortfolioRequestState {
  const [requestState, setRequestState] =
    useState<PortfolioRequestState>(RequestStateInitial);

  const wallet = useWallet();
  const cosmosAPI = useCosmosAPI();
  const staking = useStakingAPI();
  const distribution = useDistributionAPI();
  const { desmosQuery, stargateQuery } = useQueryClient();

  const isValidAddress = useCallback(
    async (address: string) => {
      try {
        await stargateQuery.getAccount(address);
      } catch {
        return false;
      }
      return true;
    },
    [stargateQuery]
  );

  const fetchPortfolio = useCallback(async () => {
    let walletAddress = "";
    setRequestState(RequestStateLoading);
    if (wallet.status !== ConnectionStatus.Connected) {
      if (!address) {
        setRequestState(RequestStateError(new Error("Wallet not connected.")));
        return;
      }
    } else {
      walletAddress = wallet.account.address;
    }
    if (address && !(await isValidAddress(address))) {
      setRequestState(RequestStateError(new Error("Invalid address.")));
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
        cosmosAPI.getBalance(address),
        cosmosAPI.getStakedBalance(address),
        staking.getUnstakingAmount(address ?? walletAddress),
        distribution.getTotalCommission(address),
        distribution.getTotalDelegationRewards(address),
        desmosQuery.getProfile(
          translateAddress(address ?? walletAddress, "desmos")
        ),
      ]);

      const balance = {
        amount: BigNumber.sum(
          availableBalance.amount,
          stakedBalance.amount,
          unstakingBalance.amount,
          commission.amount,
          reward.amount
        ),
        denom: availableBalance.denom,
      };

      setRequestState(
        RequestStateLoaded({
          profile,
          balance,
          stakedBalance,
          unstakingBalance,
          commission,
          reward,
          availableBalance,
          address: address ?? walletAddress,
        })
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRequestState(RequestStateError(err));
      }
      console.log("Failed to handle fetch portfolio error =", err);
    }
  }, [
    wallet,
    address,
    isValidAddress,
    cosmosAPI,
    staking,
    desmosQuery,
    distribution,
  ]);

  useEffect(() => {
    fetchPortfolio().catch((err) => {
      setRequestState(RequestStateError(err));
    });
  }, [fetchPortfolio]);

  return requestState;
}
