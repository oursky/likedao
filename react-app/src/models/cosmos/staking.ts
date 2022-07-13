import {
  Coin,
  MsgDelegateEncodeObject,
  MsgUndelegateEncodeObject,
} from "@cosmjs/stargate";
import BigNumber from "bignumber.js";
import {
  BondStatus,
  Description,
} from "cosmjs-types/cosmos/staking/v1beta1/staking";
import {
  MsgDelegate,
  MsgUndelegate,
} from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import Long from "long";
import { BigNumberCoin } from "../coin";

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

interface ValidatorCommission {
  commissionRates: {
    /** rate is the commission rate charged to delegators, as a fraction. */
    rate: BigNumber;
    /** max_rate defines the maximum commission rate which validator can ever charge, as a fraction. */
    maxRate: BigNumber;
    /** max_change_rate defines the maximum daily increase of the validator commission, as a fraction. */
    maxChangeRate: BigNumber;
  };
  updateTime: Date | null;
}

export interface ValidatorRPC {
  operatorAddress: string;
  consensusPubkey: Any;
  consensusPubAddr: string;
  jailed: boolean;
  status: BondStatus;
  tokens: BigNumberCoin;
  delegatorShares: string;
  description: Description;
  unbondingHeight: Long;
  unbondingTime: Date | null;
  commission: ValidatorCommission;
  minSelfDelegation: BigNumberCoin;
  selfDelegation?: BigNumberCoin;
  votePower: number;
}

export { newDelegateMessage, newUndelegateMessage };
