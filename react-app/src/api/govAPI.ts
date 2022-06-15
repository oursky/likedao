import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import {
  makeSubmitProposalMessage,
  ProposalContentBody,
} from "../models/cosmos/gov";
import { useQueryClient } from "../providers/QueryClientProvider";
import { BigNumberCoin } from "../models/coin";
import {
  convertTokenToMinimalToken,
  convertMinimalTokenToToken,
} from "../utils/coin";
import { SignedTx, useCosmosAPI } from "./cosmosAPI";

interface IGovAPI {
  getMinDepositParams(): Promise<BigNumberCoin>;
  signSubmitProposalTx(
    proposal: ProposalContentBody,
    initialDeposit: BigNumber,
    memo?: string
  ): Promise<SignedTx>;
}

export const useGovAPI = (): IGovAPI => {
  const wallet = useWallet();
  const cosmos = useCosmosAPI();
  const { query } = useQueryClient();
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

  const getMinDepositParams = useCallback(async () => {
    const params = await query.gov.params("deposit");

    const coin = params.depositParams?.minDeposit.find(
      (c) => c.denom === coinMinimalDenom
    );

    const coinAmount = new BigNumber(coin?.amount ?? 0);

    return {
      denom: coinMinimalDenom,
      amount: convertMinimalTokenToToken(coinAmount),
    };
  }, [coinMinimalDenom, query]);

  return useMemo(
    () => ({
      getMinDepositParams,
      signSubmitProposalTx,
    }),
    [getMinDepositParams, signSubmitProposalTx]
  );
};
