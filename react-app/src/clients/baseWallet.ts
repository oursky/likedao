import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { ChainInfo } from "../config/Config";
import { SignDataMessageResponse } from "../models/cosmos/tx";

export type WalletProvider = SigningStargateClient & ArbitrarySigner;
export interface ArbitrarySigner {
  readonly signArbitrary: (
    signer: string,
    data: string | Uint8Array
  ) => Promise<SignDataMessageResponse>;
}

export class BaseWallet {
  protected chainInfo: ChainInfo;

  public offlineSigner: OfflineSigner;
  public provider: WalletProvider;

  constructor(
    chainInfo: ChainInfo,
    offlineSigner: OfflineSigner,
    provider: WalletProvider
  ) {
    this.offlineSigner = offlineSigner;
    this.chainInfo = chainInfo;
    this.provider = provider;
  }

  // eslint-disable-next-line class-methods-use-this
  async disconnect(): Promise<void> {
    throw new Error("Expected to be overridden");
  }
}
