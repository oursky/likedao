import BigNumber from "bignumber.js";

export function convertToReadableBalance(
  amount: BigNumber,
  shiftDecimals: number = 0,
  decimalPlaces: number = 3
): string {
  return amount.shiftedBy(-shiftDecimals).toFixed(decimalPlaces, 1); // 1 means round down
}
