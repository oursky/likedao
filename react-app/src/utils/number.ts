import BigNumber from "bignumber.js";
import millify from "millify";

export function convertBigNumberToFixedPointString(
  amount: BigNumber,
  decimalPlaces: number = 3
): string {
  return amount.toFixed(decimalPlaces, 1); // 1 means round down
}

export function convertBigNumberToLocalizedIntegerString(
  amount: BigNumber
): string {
  return amount.integerValue().toNumber().toLocaleString();
}

export function convertBigNumberToMillifiedIntegerString(
  amount: BigNumber,
  precisionThreshold: number = 7,
  decimalPlaces: number = 2
): string {
  const integer = amount.integerValue();

  if (integer.precision() < precisionThreshold) {
    return integer.toNumber().toLocaleString();
  }
  return millify(integer.toNumber(), {
    precision: decimalPlaces,
  });
}
