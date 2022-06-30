import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import {
  makeDepositMessage,
  makeSubmitProposalMessage,
  makeVoteMessage,
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
  signVoteProposalTx(
    proposalId: number,
    option: VoteOption,
    memo?: string
  ): Promise<SignedTx>;
  signDepositProposalTx(
    proposalId: number,
    amount: BigNumber,
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

  const signVoteProposalTx = useCallback(
    async (proposalId: number, option: VoteOption, memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const { address } = wallet.account;

      const request = makeVoteMessage({
        proposalId,
        voter: address,
        option,
      });

      return cosmos.signTx([request], memo);
    },
    [cosmos, wallet]
  );

  const signDepositProposalTx = useCallback(
    async (proposalId: number, amount: BigNumber, memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const { address } = wallet.account;

      const balance = await cosmos.getBalance();
      const minimalDeposit = convertTokenToMinimalToken(amount);

      if (balance.amount.isLessThan(minimalDeposit)) {
        throw new Error("Insufficient funds");
      }

      const deposit = {
        denom: coinMinimalDenom,
        amount: minimalDeposit.toFixed(),
      };

      const request = makeDepositMessage({
        proposalId,
        depositor: address,
        amount: [deposit],
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
      signVoteProposalTx,
      signDepositProposalTx,
    }),
    [
      getMinDepositParams,
      signSubmitProposalTx,
      signVoteProposalTx,
      signDepositProposalTx,
    ]
  );
};
