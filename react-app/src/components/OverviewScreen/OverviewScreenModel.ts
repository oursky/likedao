import BigNumber from "bignumber.js";
import { BigNumberCoin } from "../../models/coin";

export interface CommunityStatus {
  inflation: BigNumber;
  bondedRatio: BigNumber;
  communityPool: BigNumberCoin;
}
