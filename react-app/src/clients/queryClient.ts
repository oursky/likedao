import {
  QueryClient,
  setupAuthExtension,
  setupBankExtension,
  setupDistributionExtension,
  setupStakingExtension,
  setupGovExtension,
  setupMintExtension,
  setupTxExtension,
  AuthExtension,
  BankExtension,
  DistributionExtension,
  StakingExtension,
  GovExtension,
  MintExtension,
  TxExtension,
  StargateClient,
} from "@cosmjs/stargate";
import {
  SlashingExtension,
  setupSlashingExtension,
} from "@cosmjs/stargate/build/modules";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { DesmosClient } from "@desmoslabs/desmjs";
import { ChainInfo } from "../config/Config";

export type ExtendedQueryClient = QueryClient &
  AuthExtension &
  BankExtension &
  DistributionExtension &
  StakingExtension &
  SlashingExtension &
  GovExtension &
  MintExtension &
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
    setupSlashingExtension,
    setupGovExtension,
    setupMintExtension,
    setupTxExtension
  );
};

export const newDesmosQueryClient = async (
  desmosRpc: string
): Promise<DesmosClient> => {
  return DesmosClient.connect(desmosRpc);
};

export const newStargateClient = async (
  chainInfo: ChainInfo
): Promise<StargateClient> => {
  return StargateClient.connect(chainInfo.chainRpc);
};
