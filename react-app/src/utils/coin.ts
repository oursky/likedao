import BigNumber from "bignumber.js";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { Decimal } from "@cosmjs/math";
import Config from "../config/Config";

const decimals = Config.chainInfo.currency.coinDecimals;

export function convertMinimalTokenToToken(
  amount: string | BigNumber | number
): BigNumber {
  const bigAmount = new BigNumber(amount);

  return bigAmount.shiftedBy(-decimals);
}

export function convertTokenToMinimalToken(
  amount: string | BigNumber | number
): BigNumber {
  const bigAmount = new BigNumber(amount);
  return bigAmount.shiftedBy(decimals);
}

/**
 * TODO: Remove and import from cosmjs/amino instead on upgrading cosmjs to v0.48 or above
 * Source: https://github.com/cosmos/cosmjs/blob/1d7014d31d08a762a87844939949158673801a16/packages/amino/src/coins.ts#L71-L80
 */
export function addCoins(lhs: Coin, rhs: Coin): Coin {
  if (lhs.denom !== rhs.denom)
    throw new Error("Trying to add two coins with different demoms");
  return {
    amount: Decimal.fromAtomics(lhs.amount, 0).plus(
      Decimal.fromAtomics(rhs.amount, 0)
    ).atomics,
    denom: lhs.denom,
  };
}
