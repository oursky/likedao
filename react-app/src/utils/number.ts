import BigNumber from "bignumber.js";
import millify from "millify";

export function convertBigNumberToFixedPointString(
  amount: BigNumber,
  shiftDecimals: number = 0,
  decimalPlaces: number = 3
): string {
  return amount.shiftedBy(-shiftDecimals).toFixed(decimalPlaces, 1); // 1 means round down
}

export function convertBigNumberToLocalizedIntegerString(
  amount: BigNumber,
  shiftDecimals: number = 0
): string {
  return amount
    .shiftedBy(-shiftDecimals)
    .integerValue()
    .toNumber()
    .toLocaleString();
}

export function convertBigNumberToMillifiedIntegerString(
  amount: BigNumber,
  shiftDecimals: number = 0,
  precisionThreshold: number = 7,
  decimalPlaces: number = 2
): string {
  const shiftedAmount = amount.shiftedBy(-shiftDecimals).integerValue();

  if (shiftedAmount.precision() < precisionThreshold) {
    return shiftedAmount.toNumber().toLocaleString();
  }
  return millify(shiftedAmount.toNumber(), {
    precision: decimalPlaces,
  });
}
