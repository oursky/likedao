import { useCallback, useMemo, useState } from "react";
import { useDistributionAPI } from "../../api/distributionAPI";
import { useStakingAPI } from "../../api/stakingAPI";
import {
  isRequestStateLoaded,
  RequestState,
  RequestStateError,
  RequestStateInitial,
  RequestStateLoaded,
  RequestStateLoading,
} from "../../models/RequestState";
import { useQueryClient } from "../../providers/QueryClientProvider";
import { useWallet, ConnectionStatus } from "../../providers/WalletProvider";
import { ColumnOrder } from "../common/Table/Table";
import { Stake } from "./StakesTablePanelModel";

export const useStakesQuery = (): {
  requestState: RequestState<Stake[]>;
  fetch: (address?: string) => Promise<void>;
  order: ColumnOrder;
  setOrder: (order: ColumnOrder) => void;
} => {
  const [requestState, setRequestState] =
    useState<RequestState<Stake[]>>(RequestStateInitial);

  const wallet = useWallet();
  const stakingAPI = useStakingAPI();
  const distribution = useDistributionAPI();
  const { query } = useQueryClient();

  const [order, setOrder] = useState({
    id: "name",
    direction: "asc" as ColumnOrder["direction"],
  });

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

  const fetchStakes = useCallback(
    async (address: string) => {
      // get stakes amount and validator address of each delegation
      const delegations = await stakingAPI.getDelegatorStakes(address);

      // get rewards of each delegations
      const validatorAddresses = delegations.map(
        (delegation) => delegation.delegation.validatorAddress
      );

      const [rewards, validators, expectedReturns] = await Promise.all([
        distribution.getDelegationRewardsByValidators(
          address,
          validatorAddresses
        ),
        stakingAPI.getValidators(validatorAddresses),
        distribution.getBatchValidatorExpectedReturn(validatorAddresses),
      ]);

      // merge stakes and delegation rewards into stake entries
      const stakeEntries: Stake[] = delegations.map((delegation, i) => ({
        ...delegation,
        reward: rewards[i],
        validator: validators[i],
        expectedReturn: expectedReturns[i],
      }));

      return stakeEntries;
    },
    [distribution, stakingAPI]
  );

  const fetch = useCallback(
    async (address?: string) => {
      setRequestState(RequestStateLoading);

      try {
        if (address) {
          if (!(await isValidAddress(address))) {
            throw new Error("Invalid address");
          }
          const stakes = await fetchStakes(address);
          setRequestState(RequestStateLoaded(stakes));
        } else {
          if (wallet.status !== ConnectionStatus.Connected) {
            throw new Error("Wallet not connected.");
          }
          const stakes = await fetchStakes(wallet.account.address);
          setRequestState(RequestStateLoaded(stakes));
        }
      } catch (err: unknown) {
        setRequestState(RequestStateError(err as Error));
      }
    },
    [fetchStakes, isValidAddress, wallet]
  );

  const requestStateSorted = useMemo(() => {
    if (!isRequestStateLoaded(requestState)) {
      return requestState;
    }
    return RequestStateLoaded(
      // eslint-disable-next-line complexity
      requestState.data.sort((a, b) => {
        switch (order.id) {
          case "name":
            return (
              a.validator.description.moniker.localeCompare(
                b.validator.description.moniker
              ) * (order.direction === "asc" ? 1 : -1)
            );
          case "staked":
            return (
              a.balance.amount.minus(b.balance.amount).toNumber() *
              (order.direction === "asc" ? 1 : -1)
            );
          case "rewards":
            return (
              a.reward.amount.minus(b.reward.amount).toNumber() *
              (order.direction === "asc" ? 1 : -1)
            );
          case "expectedReturns":
            return (
              (a.expectedReturn - b.expectedReturn) *
              (order.direction === "asc" ? 1 : -1)
            );
          case "votingPower":
            return (
              (a.validator.votePower - b.validator.votePower) *
              (order.direction === "asc" ? 1 : -1)
            );
          default:
            return 1;
        }
      })
    );
  }, [order.direction, order.id, requestState]);

  return {
    requestState: requestStateSorted,
    fetch,
    order,
    setOrder,
  };
};
