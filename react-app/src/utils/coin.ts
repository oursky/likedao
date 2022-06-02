import BigNumber from "bignumber.js";
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
