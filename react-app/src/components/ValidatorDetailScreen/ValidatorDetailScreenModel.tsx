import { Delegation } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { ValidatorSigningInfo } from "cosmjs-types/cosmos/slashing/v1beta1/slashing";
import { BigNumberCoin } from "../../models/coin";
import { ValidatorRPC } from "../../models/cosmos/staking";

export interface YourStake {
  delegation: Delegation;
  balance: BigNumberCoin;
  reward: BigNumberCoin;
}

export default interface ValidatorDetailScreenModel {
  validator: ValidatorRPC;
  signingInfo: ValidatorSigningInfo;
  uptime: number;
  stake: YourStake | null;
  expectedReturn: number;
}
