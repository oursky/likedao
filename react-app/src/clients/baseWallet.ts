import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { ChainInfo } from "../config/Config";
import { ExtendedQueryClient } from "./queryClient";

export class BaseWallet {
  protected chainInfo: ChainInfo;

  public offlineSigner: OfflineSigner;
  public provider: SigningStargateClient;
  public query: ExtendedQueryClient;

  constructor(
    chainInfo: ChainInfo,
    offlineSigner: OfflineSigner,
    provider: SigningStargateClient,
    queryClient: ExtendedQueryClient
  ) {
    this.offlineSigner = offlineSigner;
    this.chainInfo = chainInfo;
    this.provider = provider;
    this.query = queryClient;
  }

  // eslint-disable-next-line class-methods-use-this
  async disconnect(): Promise<void> {
    throw new Error("Expected to be overridden");
  }
}
