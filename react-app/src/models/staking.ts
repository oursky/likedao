import { Decimal } from "@cosmjs/math";
import BigNumber from "bignumber.js";
import { ValidatorSigningInfo } from "cosmjs-types/cosmos/slashing/v1beta1/slashing";
import {
  Commission,
  Delegation,
  Pool,
  Validator,
} from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { Any } from "cosmjs-types/google/protobuf/any";
import Config from "../config/Config";
import { pubKeyToBech32 } from "../utils/address";
import { convertTimestampToDate } from "../utils/datetime";
import { BigNumberCoin } from "./coin";

export interface YourStake {
  delegation: Delegation;
  balance: BigNumberCoin;
  reward: BigNumberCoin;
}
export interface BigNumberValidatorCommission {
  commissionRates: {
    /** rate is the commission rate charged to delegators, as a fraction. */
    rate: BigNumber;
    /** max_rate defines the maximum commission rate which validator can ever charge, as a fraction. */
    maxRate: BigNumber;
    /** max_change_rate defines the maximum daily increase of the validator commission, as a fraction. */
    maxChangeRate: BigNumber;
  };
  updateTime: Date | null;
}

export interface BigNumberDelegation {
  delegation: Delegation;
  balance: BigNumberCoin;
}

export function convertCommissionToBigNumberValidatorCommission(
  commission: Commission | null
): BigNumberValidatorCommission {
  const commissionUpdateTime = commission?.updateTime
    ? convertTimestampToDate(commission.updateTime)
    : null;

  return {
    commissionRates: {
      // Default cosmos decimal places is 18
      rate: new BigNumber(commission?.commissionRates?.rate ?? 0).shiftedBy(
        -18
      ),
      maxRate: new BigNumber(
        commission?.commissionRates?.maxRate ?? 0
      ).shiftedBy(-18),
      maxChangeRate: new BigNumber(
        commission?.commissionRates?.maxChangeRate ?? 0
      ).shiftedBy(-18),
    },
    updateTime: commissionUpdateTime,
  };
}
export function convertPubKeyToConsensusAddress(consensusPubkey: Any): string {
  return pubKeyToBech32(
    consensusPubkey,
    Config.chainInfo.bech32Config.bech32PrefixConsAddr
  );
}
export function calculateValidatorUptime(
  signingInfo: ValidatorSigningInfo,
  currentBlockHeight: number
): number {
  return (
    1 -
    signingInfo.missedBlocksCounter.toNumber() /
      (currentBlockHeight - signingInfo.startHeight.toNumber())
  );
}

export function calculateValidatorExpectedReturn(
  annualProvisions: Decimal,
  stakingPool: Pool,
  validator: Validator
): number {
  const pctCommission = new BigNumber(1).minus(
    new BigNumber(validator.commission?.commissionRates?.rate ?? 0).shiftedBy(
      -18
    )
  );

  const provision = new BigNumber(annualProvisions.toString());
  const bonded = new BigNumber(stakingPool.bondedTokens);
  const expectedRewards = pctCommission.times(provision.div(bonded));

  return expectedRewards.toNumber();
}

export function calculateValidatorVotingPower(
  stakingPool: Pool,
  delegatedTokens: BigNumber
): number {
  return delegatedTokens.div(stakingPool.bondedTokens).toNumber();
}
