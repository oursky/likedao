import { useCallback, useMemo } from "react";
import { newSendMessage } from "../models/cosmos/bank";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import { convertTokenToMinimalToken } from "../utils/coin";
import Config from "../config/Config";
import { SignedTx, useCosmos } from "./cosmosAPI";

interface IBankAPI {
  signSendTokenTx(
    recipent: string,
    amount: string,
    memo?: string
  ): Promise<SignedTx>;
}

export const useBank = (): IBankAPI => {
  const wallet = useWallet();
  const cosmos = useCosmos();
  const chainInfo = Config.chainInfo;

  const signSendTokenTx = useCallback(
    async (recipent: string, amount: string, memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const coinAmount = convertTokenToMinimalToken(amount);

      const { address } = wallet.account;

      const balance = await cosmos.getBalance();
      const coinBalance = convertTokenToMinimalToken(balance.amount);

      if (coinBalance.isLessThan(coinAmount)) {
        throw new Error("Insufficient funds");
      }

      const request = newSendMessage({
        fromAddress: address,
        toAddress: recipent,
        amount: [
          {
            denom: chainInfo.currency.coinMinimalDenom,
            amount: coinAmount.toFixed(),
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
