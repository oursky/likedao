import {
  Coin,
  MsgDelegateEncodeObject,
  MsgUndelegateEncodeObject,
} from "@cosmjs/stargate";
import {
  MsgDelegate,
  MsgUndelegate,
} from "cosmjs-types/cosmos/staking/v1beta1/tx";
interface DelegateMessageBody {
  delegatorAddress: string;
  validatorAddress: string;
  amount: Coin;
}

function newDelegateMessage(
  body: DelegateMessageBody
): MsgDelegateEncodeObject {
  return {
    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
    value: MsgDelegate.fromPartial({
      delegatorAddress: body.delegatorAddress,
      validatorAddress: body.validatorAddress,
      amount: body.amount,
    }),
  };
}

interface UndelegateMessageBody {
  delegatorAddress: string;
  validatorAddress: string;
  amount: Coin;
}

function newUndelegateMessage(
  body: UndelegateMessageBody
): MsgUndelegateEncodeObject {
  return {
    typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
    value: MsgUndelegate.fromPartial({
      delegatorAddress: body.delegatorAddress,
      validatorAddress: body.validatorAddress,
      amount: body.amount,
    }),
  };
}

export { newDelegateMessage, newUndelegateMessage };
