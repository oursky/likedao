export enum ChainStatus {
  Online = "online",
  Congested = "congested",
  Halted = "halted",
}

export interface AppSideBarModel {
  latestHeight: number;
  chainStatus: ChainStatus;
}
