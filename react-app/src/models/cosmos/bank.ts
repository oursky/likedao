import { Coin, MsgSendEncodeObject } from "@cosmjs/stargate";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";

interface SendMessageBody {
  fromAddress: string;
  toAddress: string;
  amount: Coin[];
}

function newSendMessage(body: SendMessageBody): MsgSendEncodeObject {
  return {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.fromPartial({
      fromAddress: body.fromAddress,
      toAddress: body.toAddress,
      amount: body.amount,
    }),
  };
}

export { newSendMessage };
