import { Profile } from "@desmoslabs/desmjs-types/desmos/profiles/v1beta1/models_profile";
import { Delegation } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { BigNumberCoin } from "../../models/coin";
import { ProposalHistory } from "../ProposalHistory/ProposalHistoryModel";

// use validator interface from graphql code gen
interface Validator {
  moniker?: string;
  // and other attributes
}

export interface Stake {
  reward: BigNumberCoin;
  delegation: Delegation;
  balance: BigNumberCoin;
  validator: Validator;
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

export interface PortfolioScreenGraphql extends ProposalHistory {}

export default interface PortfolioScreenModel {
  portfolio: Portfolio;
  stakes: Stake[];
}
