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
