import { useCallback, useState } from "react";
import BigNumber from "bignumber.js";
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
import { useQueryClient } from "../../providers/QueryClientProvider";
import {
  calculateValidatorExpectedReturn,
  calculateValidatorUptime,
  calculateValidatorVotingPower,
  convertCommissionToBigNumberValidatorCommission,
  convertPubKeyToConsensusAddress,
} from "../../models/staking";
import { translateAddress } from "../../utils/address";
import Config from "../../config/Config";
import { convertMinimalTokenToToken } from "../../utils/coin";
import ValidatorDetailScreenModel, {
  Validator,
} from "./ValidatorDetailScreenModel";

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
  const { query, stargateQuery } = useQueryClient();

  const fetch = useCallback(
    // eslint-disable-next-line complexity
    async (validatorAddress: string) => {
      setRequestState(RequestStateLoading);
      try {
        const walletConnected = wallet.status === ConnectionStatus.Connected;

        const [
          currentBlockHeight,
          annualProvision,
          stakingPool,
          validator,
          stake,
          reward,
        ] = await Promise.all([
          stargateQuery.getHeight(),
          query.mint.annualProvisions(),
          stakingAPI.getPool(),
          stakingAPI.getValidator(validatorAddress),
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

        if (!validator.consensusPubkey) {
          throw new Error("Validator has no consensus pubkey");
        }

        // Calculate expected return
        const expectedReturn = calculateValidatorExpectedReturn(
          annualProvision,
          stakingPool,
          validator
        );

        // Calculate uptime
        const consensusAddress = convertPubKeyToConsensusAddress(
          validator.consensusPubkey
        );

        const signingInfo = await slashingAPI.getSigningInfo(consensusAddress);

        const uptime = calculateValidatorUptime(
          signingInfo,
          currentBlockHeight
        );

        // Calculate commission
        const commission = convertCommissionToBigNumberValidatorCommission(
          validator.commission ?? null
        );

        // Get self delegations
        const selfDelegationAddress = translateAddress(
          validator.operatorAddress,
          Config.chainInfo.bech32Config.bech32PrefixAccAddr
        );

        const selfDelegation = (
          await stakingAPI.getDelegation(
            selfDelegationAddress,
            validator.operatorAddress
          )
        )?.balance;

        // Get voting power
        const votingPower = calculateValidatorVotingPower(
          stakingPool,
          new BigNumber(validator.tokens)
        );

        const aggregatedValidator: Validator = {
          operatorAddress: validator.operatorAddress,
          consensusPubAddr: consensusAddress,
          jailed: validator.jailed,
          status: validator.status,
          tokens: {
            amount: convertMinimalTokenToToken(validator.tokens),
            denom: Config.chainInfo.currency.coinDenom,
          },
          description: validator.description!,
          commission,
          minSelfDelegation: {
            amount: convertMinimalTokenToToken(validator.minSelfDelegation),
            denom: Config.chainInfo.currency.coinDenom,
          },
          selfDelegation,
          selfDelegationAddress,
          votingPower,
          uptime,
          signingInfo,
          expectedReturn,
        };

        setRequestState(
          RequestStateLoaded({
            validator: aggregatedValidator,
            stake:
              stake !== null && reward !== null ? { ...stake, reward } : null,
          })
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setRequestState(RequestStateError(err));
        }
      }
    },
    [
      wallet,
      stargateQuery,
      query.mint,
      stakingAPI,
      distributionAPI,
      slashingAPI,
    ]
  );

  return { requestState, fetch };
};
