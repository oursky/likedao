import { Decimal } from "@cosmjs/math";
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

export function convertUInt8ArrayToDecimal(n: Uint8Array): Decimal {
  return Decimal.fromAtomics(Buffer.from(n).toString("utf8"), n.length);
}

/**
 * Format cosmos Decimal to number in percentage
 * @param d - input decimal
 * @returns number in percentage
 */
export function formatDecimalToPercentage(
  d: Decimal,
  precision: number = 2
): number {
  return parseFloat((d.toFloatApproximation() * 100).toFixed(precision));
}
