import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { ChainInfo } from "../config/Config";
import { BaseWallet } from "./baseWallet";

export class KeplrWallet extends BaseWallet {
  static async connect(chainInfo: ChainInfo): Promise<KeplrWallet> {
    const keplrClient = window.keplr;

    await keplrClient.experimentalSuggestChain(window.keplrChainInfo);

    await keplrClient.enable(chainInfo.chainId);

    const offlineSigner = window.getOfflineSigner(
      chainInfo.chainId
    ) as OfflineSigner;

    const cosmJS = await SigningStargateClient.connectWithSigner(
      chainInfo.chainRpc,
      offlineSigner
    );

    return new KeplrWallet(chainInfo, offlineSigner, cosmJS);
  }

  // eslint-disable-next-line class-methods-use-this
  async disconnect(): Promise<void> {
    console.log("No action");
  }
}
