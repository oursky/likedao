import { useCallback, useEffect, useMemo, useState } from "react";
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

export function usePortfolioQuery(): PortfolioRequestState {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Portfolio>();
  const [error, setError] = useState<Error>();

  const wallet = useWallet();
  const cosmosAPI = useCosmosAPI();
  const staking = useStakingAPI();
  const { desmosQuery } = useQueryClient();

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    if (wallet.status !== ConnectionStatus.Connected) {
      setError(new Error("Wallet not connected!"));
      return;
    }
    try {
      const [balance, balanceStaked, balanceUnstaking, profile] =
        await Promise.all([
          cosmosAPI.getBalance(),
          cosmosAPI.getBalanceStaked(),
          staking.getAmountUnstaking(wallet.account.address),
          desmosQuery.getProfile(
            translateAddress(wallet.account.address, "desmos")
          ),
        ]);

      const balanceAvailable = {
        amount: balance.amount
          .minus(balanceStaked.amount)
          .minus(balanceUnstaking.amount),
        denom: balance.denom,
      };

      setData({
        profile,
        balance,
        balanceStaked,
        balanceUnstaking,
        balanceAvailable,
        address: wallet.account.address,
      });
      setLoading(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err);
      }
      console.log("Failed to handle fetch portfolio error =", err);
    }
  }, [wallet, cosmosAPI, staking, desmosQuery, setError]);

  useEffect(() => {
    fetchPortfolio().catch((err) => {
      setError(err);
    });
  }, [fetchPortfolio]);

  const requestState = useMemo<PortfolioRequestState>(() => {
    if (data !== undefined) {
      return RequestStateLoaded(data);
    }
    if (error !== undefined) {
      return RequestStateError(error);
    }
    if (loading) {
      return RequestStateLoading;
    }
    return RequestStateInitial;
  }, [loading, error, data]);

  return requestState;
}
