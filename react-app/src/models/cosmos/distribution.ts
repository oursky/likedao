import { MsgWithdrawDelegatorRewardEncodeObject } from "@cosmjs/stargate";
import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx";

interface WithdrawDelegatorRewardMessageBody {
  delegatorAddress: string;
  validatorAddress: string;
}

function newWithdrawDelegatorRewardMessage(
  body: WithdrawDelegatorRewardMessageBody
): MsgWithdrawDelegatorRewardEncodeObject {
  return {
    typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
    value: MsgWithdrawDelegatorReward.fromPartial({
      delegatorAddress: body.delegatorAddress,
      validatorAddress: body.validatorAddress,
    }),
  };
}

export interface DistributionParam {
  communityTax: number;
  baseProposerReward: number;
  bonusProposerReward: number;
  withdrawAddrEnabled: boolean;
}

export { newWithdrawDelegatorRewardMessage };
