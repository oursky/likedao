import { Buffer } from "buffer";
import { AccountData, OfflineSigner } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { payloadId } from "@walletconnect/utils";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { bech32 } from "bech32";
import { ChainInfo } from "../config/Config";
import {
  newSignDataMessage,
  SignDataMessageResponse,
} from "../models/cosmos/tx";
import { ArbitrarySigner, BaseWallet, WalletProvider } from "./baseWallet";

interface WalletConnectWalletConnectOptions {
  onDisconnect: () => void;
}

export class WalletConnectWallet extends BaseWallet {
  private connector: WalletConnect;

  private constructor(
    chainInfo: ChainInfo,
    offlineSigner: OfflineSigner,
    provider: WalletProvider,
    connector: WalletConnect
  ) {
    super(chainInfo, offlineSigner, provider);
    this.connector = connector;
  }

  static async connect(
    chainInfo: ChainInfo,
    options?: WalletConnectWalletConnectOptions
  ): Promise<WalletConnectWallet> {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org",
      qrcodeModal: QRCodeModal,
      qrcodeModalOptions: {
        desktopLinks: [],
        mobileLinks: [],
      },
    });

    if (connector.connected) {
      await connector.killSession();
      return WalletConnectWallet.connect(chainInfo, options);
    }

    connector.on("disconnect", () => {
      options?.onDisconnect();
    });

    await connector.connect();

    const [account] = await connector.sendCustomRequest({
      id: payloadId(),
      jsonrpc: "2.0",
      method: "cosmos_getAccounts",
      params: [chainInfo.chainId],
    });

    if (!account) {
      throw new Error(`Failed to connect to WalletConnect`);
    }

    const { address: hexAddress, algo, pubKey: pubKeyHex } = account;

    if (!hexAddress || !algo || !pubKeyHex) {
      throw new Error(`Failed to connect to WalletConnect`);
    }

    const address = bech32.encode(
      chainInfo.bech32Config.bech32PrefixAccAddr,
      bech32.toWords(Buffer.from(hexAddress, "hex"))
    );

    const pubkey = new Uint8Array(Buffer.from(pubKeyHex, "hex"));
    const accounts: readonly AccountData[] = [{ address, algo, pubkey }];
    const offlineSigner: OfflineSigner = {
      getAccounts: async () => Promise.resolve(accounts),
      signDirect: async (signerAddress, signDoc) => {
        const signDocJSON = SignDoc.toJSON(signDoc);
        const resInJSON = await connector.sendCustomRequest({
          id: payloadId(),
          jsonrpc: "2.0",
          method: "cosmos_signDirect",
          params: [signerAddress, signDocJSON],
        });

        return {
          signed: SignDoc.fromJSON(resInJSON.signed),
          signature: resInJSON.signature,
        };
      },
    };

    const signArbitrary = async (
      signer: string,
      data: string | Uint8Array
    ): Promise<SignDataMessageResponse> => {
      if (signer !== address) {
        throw new Error(`Signer ${signer} doesn't match public key address`);
      }

      // Align with Keplr
      const base64data = Buffer.from(data).toString("base64");

      const signDocJSON = newSignDataMessage({ signer, data: base64data });

      const [resInJSON] = await connector.sendCustomRequest({
        id: payloadId(),
        jsonrpc: "2.0",
        method: "cosmos_signAmino",
        // LikerLand Authcore skips the first param
        params: ["", signer, signDocJSON],
      });

      return {
        signed: resInJSON.signed,
        signature: resInJSON.signature,
      };
    };

    const arbitrarySigner: ArbitrarySigner = {
      signArbitrary: signArbitrary,
    };

    const stargateClient = await SigningStargateClient.connectWithSigner(
      chainInfo.chainRpc,
      offlineSigner
    );

    return new WalletConnectWallet(
      chainInfo,
      offlineSigner,
      Object.assign(stargateClient, arbitrarySigner),
      connector
    );
  }

  async disconnect(): Promise<void> {
    await this.connector.killSession();
  }
}
