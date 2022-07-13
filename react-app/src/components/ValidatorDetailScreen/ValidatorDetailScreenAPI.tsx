import { useCallback, useState } from "react";
import {
  RequestState,
  RequestStateError,
  RequestStateInitial,
  RequestStateLoaded,
  RequestStateLoading,
} from "../../models/RequestState";
import { useStakingAPI } from "../../api/stakingAPI";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { useDistributionAPI } from "../../api/distributionAPI";
import { useSlashingAPI } from "../../api/slashingAPI";
import ValidatorDetailScreenModel from "./ValidatorDetailScreenModel";

interface ValidatorQuery {
  (): {
    fetch: (validatorAddress: string) => Promise<void>;
    requestState: RequestState<ValidatorDetailScreenModel>;
  };
}

export const useValidatorQuery: ValidatorQuery = () => {
  const [requestState, setRequestState] =
    useState<RequestState<ValidatorDetailScreenModel>>(RequestStateInitial);

  const wallet = useWallet();
  const stakingAPI = useStakingAPI();
  const slashingAPI = useSlashingAPI();
  const distributionAPI = useDistributionAPI();

  const fetch = useCallback(
    // eslint-disable-next-line complexity
    async (validatorAddress: string) => {
      setRequestState(RequestStateLoading);
      try {
        const walletConnected = wallet.status === ConnectionStatus.Connected;

        const [validator, expectedReturn, stake, reward] = await Promise.all([
          stakingAPI.getValidator(validatorAddress),
          distributionAPI.getValidatorExpectedReturn(validatorAddress),
          walletConnected
            ? stakingAPI.getDelegation(wallet.account.address, validatorAddress)
            : Promise.resolve(null),
          walletConnected
            ? distributionAPI.getDelegationRewardsByValidator(
                wallet.account.address,
                validatorAddress
              )
            : Promise.resolve(null),
        ]);

        const [signingInfo, uptime] = await Promise.all([
          slashingAPI.getSigningInfo(validator.consensusPubAddr),
          slashingAPI.getValidatorUptime(validator.consensusPubAddr),
        ]);

        const res = {
          validator,
          uptime,
          stake:
            stake !== null && reward !== null ? { ...stake, reward } : null,
          signingInfo,
          expectedReturn,
        };
        setRequestState(RequestStateLoaded(res));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setRequestState(RequestStateError(err));
        }
      }
    },
    [stakingAPI, distributionAPI, slashingAPI, wallet]
  );

  return { requestState, fetch };
};
