import { OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { ChainInfo } from "../config/Config";
import {
  newSignDataMessage,
  SignDataMessageResponse,
} from "../models/cosmos/tx";
import { ArbitrarySigner, BaseWallet, WalletProvider } from "./baseWallet";

export class KeplrWallet extends BaseWallet {
  private constructor(
    chainInfo: ChainInfo,
    offlineSigner: OfflineSigner,
    provider: WalletProvider
  ) {
    super("keplr", chainInfo, offlineSigner, provider);
  }

  static async connect(chainInfo: ChainInfo): Promise<KeplrWallet> {
    const keplrClient = window.keplr;

    await keplrClient.experimentalSuggestChain(window.keplrChainInfo);

    await keplrClient.enable(chainInfo.chainId);

    const offlineSigner = window.getOfflineSigner(
      chainInfo.chainId
    ) as OfflineSigner;

    const signArbitrary = async (
      signer: string,
      data: string | Uint8Array
    ): Promise<SignDataMessageResponse> => {
      // Keplr makes its own signDoc, so we have to replicate one here
      const base64data = Buffer.from(data).toString("base64");
      const signDoc = newSignDataMessage({ signer, data: base64data });

      const signature = await window.keplr.signArbitrary(
        chainInfo.chainId,
        signer,
        data
      );

      return { signed: signDoc, signature };
    };

    const arbitrarySigner: ArbitrarySigner = {
      signArbitrary: signArbitrary,
    };

    const stargateClient = await SigningStargateClient.connectWithSigner(
      chainInfo.chainRpc,
      offlineSigner
    );

    return new KeplrWallet(
      chainInfo,
      offlineSigner,
      Object.assign(stargateClient, arbitrarySigner)
    );
  }

  // eslint-disable-next-line class-methods-use-this
  async disconnect(): Promise<void> {
    console.log("No action");
  }
}
