import { StdSignature, StdSignDoc } from "@cosmjs/amino";

interface SignDataMessageRequestBody {
  signer: string;
  data: string | Uint8Array;
}

export interface SignDataMessageResponse {
  signed: StdSignDoc;
  signature: StdSignature;
}

export function newSignDataMessage(
  body: SignDataMessageRequestBody
): StdSignDoc {
  return {
    chain_id: "",
    account_number: "0",
    sequence: "0",
    fee: {
      gas: "0",
      amount: [],
    },
    msgs: [
      {
        type: "sign/MsgSignData",
        value: {
          signer: body.signer,
          data: body.data,
        },
      },
    ],
    memo: "",
  };
}
