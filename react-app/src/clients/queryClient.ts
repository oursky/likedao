import {
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupDistributionExtension,
  setupStakingExtension,
  setupGovExtension,
  setupTxExtension,
  AuthExtension,
  BankExtension,
  DistributionExtension,
  StakingExtension,
  GovExtension,
  TxExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { DesmosClient } from "@desmoslabs/desmjs";
import { ChainInfo } from "../config/Config";

export type ExtendedQueryClient = QueryClient &
  AuthExtension &
  BankExtension &
  DistributionExtension &
  StakingExtension &
  GovExtension &
  TxExtension;

export const newQueryClient = async (
  chainInfo: ChainInfo
): Promise<ExtendedQueryClient> => {
  const tmClient = await Tendermint34Client.connect(chainInfo.chainRpc);
  return QueryClient.withExtensions(
    tmClient,
    setupAuthExtension,
    setupBankExtension,
    setupDistributionExtension,
    setupStakingExtension,
    setupGovExtension,
    setupTxExtension
  );
};

export const newDesmosQueryClient = async (
  desmosRpc: string
): Promise<DesmosClient> => {
  return DesmosClient.connect(desmosRpc);
};
