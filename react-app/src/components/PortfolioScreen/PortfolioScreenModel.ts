import { Delegation } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { BigNumberCoin } from "../../models/coin";
import { ProposalHistory } from "../ProposalHistory/ProposalHistoryModel";
import { ValidatorRPC } from "../../models/cosmos/staking";

export interface Stake {
  reward: BigNumberCoin;
  delegation: Delegation;
  balance: BigNumberCoin;
  validator: ValidatorRPC;
  expectedReturn: number;
}

export interface Portfolio {
  balance: BigNumberCoin;
  stakedBalance: BigNumberCoin;
  unstakingBalance: BigNumberCoin;
  availableBalance: BigNumberCoin;
  commission: BigNumberCoin;
  reward: BigNumberCoin;
  address: string;
}

export interface PortfolioScreenGraphql extends ProposalHistory {}
