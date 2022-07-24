import {
  BondStatus,
  Description,
} from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { ValidatorSigningInfo } from "cosmjs-types/cosmos/slashing/v1beta1/slashing";
import { BigNumberCoin } from "../../models/coin";
import { BigNumberValidatorCommission, YourStake } from "../../models/staking";

export interface Validator {
  operatorAddress: string;
  consensusPubAddr: string;
  jailed: boolean;
  status: BondStatus;
  tokens: BigNumberCoin;
  description: Description;
  commission: BigNumberValidatorCommission;
  minSelfDelegation: BigNumberCoin;
  selfDelegation?: BigNumberCoin;
  selfDelegationAddress: string;
  votingPower: number;
  signingInfo: ValidatorSigningInfo;
  uptime: number;
  expectedReturn: number;
}

export default interface ValidatorDetailScreenModel {
  validator: Validator;
  stake: YourStake | null;
}
