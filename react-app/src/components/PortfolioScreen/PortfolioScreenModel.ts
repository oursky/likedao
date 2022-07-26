import { BigNumberCoin } from "../../models/coin";
import { ProposalHistory } from "../ProposalHistory/ProposalHistoryModel";

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
