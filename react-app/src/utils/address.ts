import { fromBech32, normalizeBech32, toBech32 } from "@cosmjs/encoding";

const ADDRESS_DIVIDER = "1";

export function truncateAddress(address: string): string {
  if (!address) {
    return "-";
  }
  const [prefix, ...rest] = address.split(ADDRESS_DIVIDER);

  const addressSuffix = rest.join("");

  return `${prefix}${ADDRESS_DIVIDER}...${addressSuffix.slice(
    addressSuffix.length - 4
  )}`;
}

/**
 * Translate bech32 address from one encoding to another
 * @param address - encoding bech32 address
 * @param prefix - target prefix of the output address
 * @returns translated bech32 address
 */
export function translateAddress(address: string, prefix: string): string {
  const normalizedAddress = normalizeBech32(address);
  const decodedAddress = fromBech32(normalizedAddress);
  const encodedAddress = toBech32(prefix, decodedAddress.data);
  return encodedAddress;
}
