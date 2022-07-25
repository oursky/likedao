import { Delegation } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { BigNumberCoin } from "../../models/coin";
import { ValidatorRPC } from "../../models/cosmos/staking";

export interface Stake {
  reward: BigNumberCoin;
  delegation: Delegation;
  balance: BigNumberCoin;
  validator: ValidatorRPC;
  expectedReturn: number;
}
