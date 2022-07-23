import {
  Delegation,
  Validator as RPCValidator,
} from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { BigNumberCoin } from "../../models/coin";

export interface StakedValidatorInfo {
  reward: BigNumberCoin;
  delegation: Delegation;
  balance: BigNumberCoin;
  validator: RPCValidator;
  expectedReturn: number;
  votingPower: number;
}
