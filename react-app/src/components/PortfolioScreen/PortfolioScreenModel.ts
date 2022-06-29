import { Profile } from "@desmoslabs/desmjs-types/desmos/profiles/v1beta1/models_profile";
import { DelegationResponse } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { BigNumberCoin } from "../../models/coin";

export interface Stake extends DelegationResponse {
  reward: BigNumberCoin;
}

export interface Portfolio {
  profile: Profile | null;
  balance: BigNumberCoin;
  stakedBalance: BigNumberCoin;
  unstakingBalance: BigNumberCoin;
  availableBalance: BigNumberCoin;
  commission: BigNumberCoin;
  reward: BigNumberCoin;
  address: string;
}

export default interface PortfolioScreenModel {
  portfolio: Portfolio;
  stakes: Stake[];
}
