import { useCallback, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import {
  PortfolioScreenQuery,
  PortfolioScreenQueryQuery,
  PortfolioScreenQueryQueryVariables,
} from "../../generated/graphql";
import { useLazyGraphQLQuery } from "../../hooks/graphql";
import { useCosmosAPI } from "../../api/cosmosAPI";
import { useQueryClient } from "../../providers/QueryClientProvider";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { translateAddress } from "../../utils/address";
import { useStakingAPI } from "../../api/stakingAPI";
import {
  isRequestStateError,
  isRequestStateLoaded,
  RequestState,
  RequestStateError,
  RequestStateInitial,
  RequestStateLoaded,
  RequestStateLoading,
} from "../../models/RequestState";
import { useDistributionAPI } from "../../api/distributionAPI";
import PortfolioScreenModel, {
  Portfolio,
  PortfolioScreenGraphql,
} from "./PortfolioScreenModel";

type PortfolioRequestState = RequestState<Portfolio | null>;

interface UsePortfolioQuery {
  (): {
    requestState: PortfolioRequestState;
    fetch: (address?: string) => Promise<void>;
  };
}

interface UsePortfolioScreenGraphqlQuery {
  (initialOffset: number, pageSize: number): {
    requestState: RequestState<PortfolioScreenGraphql>;
    fetch: (variables: PortfolioScreenQueryQueryVariables) => void;
  };
}

interface UsePortfolioScreenQuery {
  (initialOffset: number, pageSize: number, address?: string): {
    requestState: RequestState<PortfolioScreenModel>;
    fetch: (
      variables: PortfolioScreenQueryQueryVariables,
      address?: string
    ) => void;
  };
}

export const usePortfolioQuery: UsePortfolioQuery = () => {
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

  const fetchWalletPortfolio = useCallback<
    () => Promise<Portfolio>
  >(async () => {
    if (wallet.status !== ConnectionStatus.Connected) {
      throw new Error("Wallet not connected.");
    }

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

    return {
      profile,
      balance,
      stakedBalance,
      unstakingBalance,
      availableBalance,
      commission,
      reward,
      address: wallet.account.address,
    };
  }, [wallet, cosmosAPI, staking, desmosQuery, distribution]);

  const fetchAddressPortfolio = useCallback<
    (address: string) => Promise<Portfolio>
  >(
    async (address) => {
      if (!(await isValidAddress(address))) {
        throw new Error("Invalid address");
      }

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
    [isValidAddress, cosmosAPI, staking, distribution, desmosQuery]
  );

  const fetch = useCallback(
    async (address?: string) => {
      setRequestState(RequestStateLoading);

      try {
        if (address) {
          const portfolio = await fetchAddressPortfolio(address);
          setRequestState(RequestStateLoaded(portfolio));
        } else {
          const portfolio = await fetchWalletPortfolio();
          setRequestState(RequestStateLoaded(portfolio));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setRequestState(RequestStateError(err));
        }
        console.error("Failed to handle fetch portfolio error =", err);
      }
    },
    [fetchAddressPortfolio, fetchWalletPortfolio]
  );

  return { requestState, fetch };
};

export const usePortfolioScreenGraphqlQuery: UsePortfolioScreenGraphqlQuery = (
  initialOffset,
  pageSize
) => {
  const [fetch, { requestState }] = useLazyGraphQLQuery<
    PortfolioScreenQueryQuery,
    PortfolioScreenQueryQueryVariables
  >(PortfolioScreenQuery, {
    variables: {
      after: initialOffset,
      first: pageSize,
      address: "",
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const callFetch = useCallback(
    (variables: PortfolioScreenQueryQueryVariables) => {
      // Errors are handled by the requestState
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch({
        variables,
      });
    },
    [fetch]
  );

  return {
    requestState,
    fetch: callFetch,
  };
};

export const usePortfolioScreenQuery: UsePortfolioScreenQuery = (
  initialOffset,
  pageSize
) => {
  const gqlQuery = usePortfolioScreenGraphqlQuery(initialOffset, pageSize);
  const portfolioQuery = usePortfolioQuery();

  const fetch = useCallback(
    (variables: PortfolioScreenQueryQueryVariables, address?: string) => {
      gqlQuery.fetch(variables);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      portfolioQuery.fetch(address);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gqlQuery.fetch, portfolioQuery.fetch]
  );

  const requestState = useMemo(() => {
    if (
      isRequestStateLoaded(gqlQuery.requestState) &&
      isRequestStateLoaded(portfolioQuery.requestState)
    ) {
      return RequestStateLoaded<PortfolioScreenModel>({
        ...gqlQuery.requestState.data,
        portfolio: portfolioQuery.requestState.data,
      });
    }

    if (isRequestStateError(gqlQuery.requestState)) {
      return RequestStateError(gqlQuery.requestState.error);
    } else if (isRequestStateError(portfolioQuery.requestState)) {
      return RequestStateError(portfolioQuery.requestState.error);
    }

    return RequestStateLoading;
  }, [gqlQuery.requestState, portfolioQuery]);

  return {
    requestState,
    fetch,
  };
};
