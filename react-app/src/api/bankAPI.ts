import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { newSendMessage } from "../models/cosmos/bank";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import { SignedTx, useCosmos } from "./cosmosAPI";

interface IBankAPI {
  signSendTokenTx(
    recipent: string,
    amount: BigNumber,
    memo?: string
  ): Promise<SignedTx>;
}

export const useBank = (): IBankAPI => {
  const wallet = useWallet();
  const cosmos = useCosmos();
  const chainInfo = Config.chainInfo;

  const signSendTokenTx = useCallback(
    async (recipent: string, amount: BigNumber, memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const { address } = wallet.account;

      const balance = await cosmos.getBalance();

      if (balance.amount.isLessThan(amount)) {
        throw new Error("Insufficient funds");
      }

      const request = newSendMessage({
        fromAddress: address,
        toAddress: recipent,
        amount: [
          {
            denom: chainInfo.currency.coinMinimalDenom,
            amount: amount.toString(),
          },
        ],
      });

      return cosmos.signTx([request], memo);
    },
    [chainInfo, cosmos, wallet]
  );

  return useMemo(
    () => ({
      signSendTokenTx,
    }),
    [signSendTokenTx]
  );
};
