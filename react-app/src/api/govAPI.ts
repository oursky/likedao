import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { Coin } from "@cosmjs/stargate";
import { ConnectionStatus, useWallet } from "../providers/WalletProvider";
import Config from "../config/Config";
import * as gov from "../models/cosmos/gov";
import { useQueryClient } from "../providers/QueryClientProvider";
import { BigNumberCoin } from "../models/coin";
import {
  convertTokenToMinimalToken,
  convertMinimalTokenToToken,
} from "../utils/coin";
import { convertUInt8ArrayToDecimal } from "../utils/number";
import { SignedTx, useCosmosAPI } from "./cosmosAPI";

interface IGovAPI {
  signSubmitProposalTx(
    proposal: gov.ProposalContentBody,
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
  getMinDepositParams(): Promise<BigNumberCoin>;
  getAllParams(): Promise<gov.GovParams>;
}

const CoinMinimalDenom = Config.chainInfo.currency.coinMinimalDenom;
const CoinDenom = Config.chainInfo.currency.coinDenom;

const getMinDepositFromAllMinDeposit = (
  minDeposit: Coin[] | undefined,
  denom: string
) => {
  if (!minDeposit) {
    return {
      denom: CoinDenom,
      amount: convertMinimalTokenToToken(0),
    };
  }

  const coin = minDeposit.find((c) => c.denom === denom);
  const coinAmount = new BigNumber(coin?.amount ?? 0);

  return {
    denom: CoinDenom,
    amount: convertMinimalTokenToToken(coinAmount),
  };
};

export const useGovAPI = (): IGovAPI => {
  const wallet = useWallet();
  const cosmos = useCosmosAPI();
  const { query } = useQueryClient();

  const signSubmitProposalTx = useCallback(
    async (
      proposal: gov.ProposalContentBody,
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
              denom: CoinMinimalDenom,
              amount: minimalDeposit.toFixed(),
            },
          ];

      const request = gov.makeSubmitProposalMessage({
        content: proposal,
        proposer: address,
        initialDeposit: deposit,
      });

      return cosmos.signTx([request], memo);
    },
    [cosmos, wallet]
  );

  const signVoteProposalTx = useCallback(
    async (proposalId: number, option: VoteOption, memo?: string) => {
      if (wallet.status !== ConnectionStatus.Connected) {
        throw new Error("Wallet not connected");
      }

      const { address } = wallet.account;

      const request = gov.makeVoteMessage({
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
        denom: CoinMinimalDenom,
        amount: minimalDeposit.toFixed(),
      };

      const request = gov.makeDepositMessage({
        proposalId,
        depositor: address,
        amount: [deposit],
      });

      return cosmos.signTx([request], memo);
    },
    [cosmos, wallet]
  );

  const getMinDepositParams = useCallback(async () => {
    const params = await query.gov.params("deposit");
    return getMinDepositFromAllMinDeposit(
      params.depositParams?.minDeposit,
      CoinMinimalDenom
    );
  }, [query.gov]);

  const getDepositParams = useCallback(async () => {
    const params = (await query.gov.params("deposit")).depositParams;
    if (!params) {
      throw new Error("Failed to fetch all governance params: deposit.");
    }
    return {
      maxDepositPeriod: params.maxDepositPeriod,
      minDeposit: getMinDepositFromAllMinDeposit(
        params.minDeposit,
        CoinMinimalDenom
      ),
    } as gov.DepositParams;
  }, [query.gov]);

  const getVotingParams = useCallback(async () => {
    const params = (await query.gov.params("voting")).votingParams;
    if (!params) {
      throw new Error("Failed to fetch all governance params: voting.");
    }
    return {
      votingPeriod: params.votingPeriod,
    } as gov.VotingParams;
  }, [query.gov]);

  const getTallyParams = useCallback(async () => {
    const params = (await query.gov.params("tallying")).tallyParams;
    if (!params) {
      throw new Error("Failed to fetch all governance params: tally.");
    }

    return {
      quorum: convertUInt8ArrayToDecimal(params.quorum),
      threshold: convertUInt8ArrayToDecimal(params.threshold),
      vetoThreshold: convertUInt8ArrayToDecimal(params.vetoThreshold),
    } as gov.TallyParams;
  }, [query.gov]);

  const getAllParams = useCallback(async () => {
    const [deposit, tally, voting] = await Promise.all([
      getDepositParams(),
      getTallyParams(),
      getVotingParams(),
    ]);
    return {
      deposit,
      tally,
      voting,
    };
  }, [getDepositParams, getTallyParams, getVotingParams]);

  return useMemo(
    () => ({
      getMinDepositParams,
      getAllParams,
      signSubmitProposalTx,
      signVoteProposalTx,
      signDepositProposalTx,
    }),
    [
      getMinDepositParams,
      getAllParams,
      signSubmitProposalTx,
      signVoteProposalTx,
      signDepositProposalTx,
    ]
  );
};
