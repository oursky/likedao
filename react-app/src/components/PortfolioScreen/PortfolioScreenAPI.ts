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
import { Portfolio } from "./PortfolioScreenModel";

type PortfolioRequestState = RequestState<Portfolio | null>;

export function usePortfolioQuery(address?: string): PortfolioRequestState {
  const [requestState, setRequestState] =
    useState<PortfolioRequestState>(RequestStateInitial);

  const wallet = useWallet();
  const cosmosAPI = useCosmosAPI();
  const staking = useStakingAPI();
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
    setRequestState(RequestStateLoading);
    if (wallet.status !== ConnectionStatus.Connected) {
      if (!address) {
        setRequestState(RequestStateError(new Error("Wallet not connected.")));
      }
      return;
    }
    if (address && !(await isValidAddress(address))) {
      setRequestState(RequestStateError(new Error("Invalid address.")));
      return;
    }
    try {
      const [availableBalance, stakedBalance, unstakingBalance, profile] =
        await Promise.all([
          cosmosAPI.getBalance(address),
          cosmosAPI.getStakedBalance(address),
          staking.getUnstakingAmount(address ?? wallet.account.address),
          desmosQuery.getProfile(
            translateAddress(address ?? wallet.account.address, "desmos")
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
          address: address ?? wallet.account.address,
        })
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRequestState(RequestStateError(err));
      }
      console.log("Failed to handle fetch portfolio error =", err);
    }
  }, [wallet, address, isValidAddress, cosmosAPI, staking, desmosQuery]);

  useEffect(() => {
    fetchPortfolio().catch((err) => {
      setRequestState(RequestStateError(err));
    });
  }, [fetchPortfolio]);

  return requestState;
}
