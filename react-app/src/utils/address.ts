import { fromBech32, normalizeBech32, toBech32 } from "@cosmjs/encoding";
import { pubkeyToRawAddress } from "@cosmjs/tendermint-rpc";
import { Any } from "cosmjs-types/google/protobuf/any";
import { PublicKey } from "cosmjs-types/tendermint/crypto/keys";

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

/**
 * Convert pubkey returned by extended stargate query client to bech32 address string
 * @param pubKey - pubkey return by extended query client client
 * @param prefix - bech32 prefix
 * @returns bech32 address
 */
export function pubKeyToBech32(pubKey: Any, prefix: string): string {
  const decodedPubKey = PublicKey.decode(pubKey.value);
  if (decodedPubKey.ed25519) {
    return toBech32(
      prefix,
      pubkeyToRawAddress("ed25519", decodedPubKey.ed25519)
    );
  } else if (decodedPubKey.secp256k1) {
    return toBech32(
      prefix,
      pubkeyToRawAddress("ed25519", decodedPubKey.secp256k1)
    );
  }
  throw new Error("invalid pubkey type");
}
