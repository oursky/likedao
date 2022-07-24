import { DelegationDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/distribution";
import { BigNumberCoin } from "./coin";

export interface BigNumberCoinDelegatorReward
  extends Omit<DelegationDelegatorReward, "reward"> {
  reward: BigNumberCoin;
}
