import { useCallback, useState } from "react";
import BigNumber from "bignumber.js";
import { useQueryClient } from "../../providers/QueryClientProvider";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { useStakingAPI } from "../../api/stakingAPI";
import {
  RequestState,
  RequestStateError,
  RequestStateInitial,
  RequestStateLoaded,
  RequestStateLoading,
} from "../../models/RequestState";
import { useDistributionAPI } from "../../api/distributionAPI";
import { useBankAPI } from "../../api/bankAPI";
import { Portfolio } from "./PortfolioScreenModel";

export const usePortfolioQuery = (): {
  requestState: RequestState<Portfolio>;
  fetch: (address?: string) => Promise<void>;
} => {
  const [requestState, setRequestState] =
    useState<RequestState<Portfolio>>(RequestStateInitial);

  const wallet = useWallet();
  const bankAPI = useBankAPI();
  const stakingAPI = useStakingAPI();
  const distributionAPI = useDistributionAPI();
  const { query } = useQueryClient();

  const isValidAddress = useCallback(
    async (address: string) => {
      try {
        const account = await query.auth.account(address);
        return account != null;
      } catch {
        return false;
      }
    },
    [query]
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
      ] = await Promise.all([
        bankAPI.getAddressBalance(address),
        stakingAPI.getAddressStakedBalance(address),
        stakingAPI.getUnstakingAmount(address),
        distributionAPI.getAddressTotalCommission(address),
        distributionAPI.getAddressTotalDelegationRewards(address),
      ]);

      const balance = {
        amount: BigNumber.sum(
          availableBalance.amount,
          stakedBalance.amount,
          unstakingBalance.amount,
          reward.amount
        ),
        denom: availableBalance.denom,
      };

      return {
        balance,
        stakedBalance,
        unstakingBalance,
        availableBalance,
        commission,
        reward,
        address,
      };
    },
    [bankAPI, stakingAPI, distributionAPI]
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
          setRequestState(RequestStateLoaded(portfolio));
        } else {
          if (wallet.status !== ConnectionStatus.Connected) {
            throw new Error("Wallet not connected.");
          }
          const portfolio = await fetchAddressPortfolio(wallet.account.address);
          setRequestState(RequestStateLoaded(portfolio));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setRequestState(RequestStateError(err));
        }
        console.error("Failed to handle fetch portfolio error =", err);
      }
    },
    [fetchAddressPortfolio, isValidAddress, wallet]
  );

  return {
    requestState,
    fetch,
  };
};
