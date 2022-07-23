import { useCallback, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
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
import {
  calculateValidatorExpectedReturn,
  calculateValidatorVotingPower,
} from "../../models/staking";
import { useQueryClient } from "../../providers/QueryClientProvider";
import { useWallet, ConnectionStatus } from "../../providers/WalletProvider";
import * as Table from "../common/Table";
import { StakedValidatorInfo } from "./StakesTablePanelModel";

export const useStakesQuery = (): {
  requestState: RequestState<StakedValidatorInfo[]>;
  fetch: (address?: string) => Promise<void>;
  order: Table.ColumnOrder;
  setOrder: (order: Table.ColumnOrder) => void;
} => {
  const [requestState, setRequestState] =
    useState<RequestState<StakedValidatorInfo[]>>(RequestStateInitial);

  const wallet = useWallet();
  const stakingAPI = useStakingAPI();
  const distributionAPI = useDistributionAPI();
  const { query } = useQueryClient();

  const [order, setOrder] = useState({
    id: "name",
    direction: "asc" as Table.ColumnOrder["direction"],
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

      const [annualProvisions, stakingPool, rewards, validators] =
        await Promise.all([
          query.mint.annualProvisions(),
          stakingAPI.getPool(),
          distributionAPI.getDelegationRewardsByValidators(
            address,
            validatorAddresses
          ),
          stakingAPI.getValidators(validatorAddresses),
        ]);

      const calculatedValidatorInfo = validators.map((validator) => {
        return {
          expectedReturn: calculateValidatorExpectedReturn(
            annualProvisions,
            stakingPool,
            validator
          ),
          votingPower: calculateValidatorVotingPower(
            stakingPool,
            new BigNumber(validator.tokens)
          ),
        };
      });

      // merge stakes and delegation rewards into stake entries
      const stakeEntries: StakedValidatorInfo[] = delegations.map(
        (delegation, i) => ({
          ...delegation,
          reward: rewards[i],
          validator: validators[i],
          expectedReturn: calculatedValidatorInfo[i].expectedReturn,
          votingPower: calculatedValidatorInfo[i].votingPower,
        })
      );

      return stakeEntries;
    },
    [distributionAPI, query.mint, stakingAPI]
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
      requestState.data.sort((a, b) => {
        const direction = order.direction === "asc" ? 1 : -1;
        switch (order.id) {
          case "name":
            return (
              a.validator.description!.moniker.localeCompare(
                b.validator.description!.moniker
              ) * direction
            );
          case "staked":
            return (
              a.balance.amount.minus(b.balance.amount).toNumber() * direction
            );
          case "rewards":
            return (
              a.reward.amount.minus(b.reward.amount).toNumber() * direction
            );
          case "expectedReturns":
            return (a.expectedReturn - b.expectedReturn) * direction;
          case "votingPower":
            return (a.votingPower - b.votingPower) * direction;
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
