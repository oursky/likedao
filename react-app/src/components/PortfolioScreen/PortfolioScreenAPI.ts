import { useCallback, useState } from "react";
import BigNumber from "bignumber.js";
import { useCosmosAPI } from "../../api/cosmosAPI";
import { useQueryClient } from "../../providers/QueryClientProvider";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { translateAddress, truncateAddress } from "../../utils/address";
import { useStakingAPI } from "../../api/stakingAPI";
import {
  RequestState,
  RequestStateError,
  RequestStateInitial,
  RequestStateLoaded,
  RequestStateLoading,
} from "../../models/RequestState";
import { useDistributionAPI } from "../../api/distributionAPI";
import PortfolioScreenModel, { Portfolio, Stake } from "./PortfolioScreenModel";

type PortfolioScreenRequestState = RequestState<PortfolioScreenModel>;

interface UsePortfolioScreenQuery {
  (): {
    requestState: PortfolioScreenRequestState;
    fetch: (address?: string) => Promise<void>;
  };
}

export const usePortfolioQuery: UsePortfolioScreenQuery = () => {
  const [requestState, setRequestState] =
    useState<PortfolioScreenRequestState>(RequestStateInitial);

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

  const fetchAddressPortfolio = useCallback<
    (address: string) => Promise<Portfolio>
  >(
    async (address) => {
      const [
        availableBalance,
        stakedBalance,
        unstakingBalance,
        commission,
        reward,
        profile,
      ] = await Promise.all([
        cosmosAPI.getAddressBalance(address),
        cosmosAPI.getAddressStakedBalance(address),
        staking.getUnstakingAmount(address),
        distribution.getAddressTotalCommission(address),
        distribution.getAddressTotalDelegationRewards(address),
        desmosQuery.getProfile(translateAddress(address, "desmos")),
      ]);

      const balance = {
        amount: BigNumber.sum(
          availableBalance.amount,
          stakedBalance.amount,
          unstakingBalance.amount
        ),
        denom: availableBalance.denom,
      };

      return {
        profile,
        balance,
        stakedBalance,
        unstakingBalance,
        availableBalance,
        commission,
        reward,
        address,
      };
    },
    [cosmosAPI, staking, distribution, desmosQuery]
  );

  const fetchStakes = useCallback(
    async (address: string) => {
      // get stakes amount and validator address of each delegation
      const delegations = await staking.getDelegatorStakes(address);

      // get rewards of each delegations
      const validatorAddresses = delegations.map(
        (delegation) => delegation.delegation.validatorAddress
      );

      const rewards = await distribution.getDelegationRewardsByValidators(
        address,
        validatorAddresses
      );

      // merge stakes and delegation rewards into stake entries
      const stakeEntries: Stake[] = delegations.map((delegation, i) => ({
        ...delegation,
        reward: rewards[i],
        validator: {
          moniker: `validator ${i + 1}`,
        },
      }));

      return stakeEntries;
    },
    [distribution, staking]
  );

  const fetch = useCallback(
    async (address?: string) => {
      setRequestState(RequestStateLoading);

      try {
        if (address) {
          if (!(await isValidAddress(address))) {
            throw new Error("Invalid address");
          }
          const portfolio = await fetchAddressPortfolio(address);
          const stakes = await fetchStakes(address);
          setRequestState(RequestStateLoaded({ portfolio, stakes }));
        } else {
          if (wallet.status !== ConnectionStatus.Connected) {
            throw new Error("Wallet not connected.");
          }
          const portfolio = await fetchAddressPortfolio(wallet.account.address);
          const stakes = await fetchStakes(wallet.account.address);
          setRequestState(RequestStateLoaded({ portfolio, stakes }));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setRequestState(RequestStateError(err));
        }
        console.error("Failed to handle fetch portfolio error =", err);
      }
    },
    [fetchAddressPortfolio, fetchStakes, isValidAddress, wallet]
  );

  return { requestState, fetch };
};
