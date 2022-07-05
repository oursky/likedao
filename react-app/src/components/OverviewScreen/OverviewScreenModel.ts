import BigNumber from "bignumber.js";
import { BigNumberCoin } from "../../models/coin";
import { Proposal } from "../proposals/ProposalModel";

export interface CommunityStatus {
  inflation: BigNumber;
  bondedRatio: BigNumber;
  communityPool: BigNumberCoin;
}

export interface OverviewScreenModel {
  communityStatus: CommunityStatus;
  proposals: Proposal[];
}
