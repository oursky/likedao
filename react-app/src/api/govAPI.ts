import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import {
  makeSubmitProposalMessage,
  ProposalContentBody,
} from "../models/cosmos/gov";
import { convertTokenToMinimalToken } from "../utils/coin";
import { SignedTx, useCosmos } from "./cosmosAPI";

interface IGovAPI {
  signSubmitProposalTx(
    proposal: ProposalContentBody,
    initialDeposit: BigNumber,
    memo?: string
  ): Promise<SignedTx>;
}

export const useGov = (): IGovAPI => {
  const wallet = useWallet();
  const cosmos = useCosmos();
  const coinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;

  const signSubmitProposalTx = useCallback(
    async (
      proposal: ProposalContentBody,
      initialDeposit: BigNumber,
      memo?: string
    ) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const { address } = wallet.account;

      const balance = await cosmos.getBalance();
      const minimalDeposit = convertTokenToMinimalToken(initialDeposit);

      if (balance.amount.isLessThan(initialDeposit)) {
        throw new Error("Insufficient funds");
      }

      const deposit = initialDeposit.isZero()
        ? []
        : [
            {
              denom: coinMinimalDenom,
              amount: minimalDeposit.toFixed(),
            },
          ];

      const request = makeSubmitProposalMessage({
        content: proposal,
        proposer: address,
        initialDeposit: deposit,
      });

      return cosmos.signTx([request], memo);
    },
    [coinMinimalDenom, cosmos, wallet]
  );

  return useMemo(
    () => ({
      signSubmitProposalTx,
    }),
    [signSubmitProposalTx]
  );
};
