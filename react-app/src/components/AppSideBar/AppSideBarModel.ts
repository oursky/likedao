import BigNumber from "bignumber.js";
import { BigNumberCoin } from "../../models/coin";

export enum ChainStatus {
  Online = "online",
  Congested = "congested",
  Halted = "halted",
}

export interface ChainHealth {
  latestHeight: number;
  chainStatus: ChainStatus;
}

export interface CommunityStatus {
  inflation: BigNumber;
  bondedRatio: BigNumber;
  communityPool: BigNumberCoin;
}
