import * as Sentry from "@sentry/react";

export interface ChainLink {
  chainId: string;
  link: string;
}

export interface ChainInfo {
  bech32Prefix: string;
  gasPrice: string;
  chainId: string;
  chainRpc: string;
  currency: {
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
  };
}

export interface IConfig {
  sentry: Pick<
    Sentry.BrowserOptions,
    "dsn" | "environment" | "ignoreErrors"
  > | null;
  chainInfo: ChainInfo;
  desmosRpc: string;
  graphql: {
    endpoint: string;
  };
  authEndpoint: string;
  chainLinks: ChainLink[];
}

const defaultConfig: IConfig = {
  sentry: null,
  chainInfo: {
    gasPrice: "200000nanolike",
    bech32Prefix: "like",
    chainId: "",
    chainRpc: "",
    currency: {
      coinDenom: "LIKE",
      coinMinimalDenom: "nanolike",
      coinDecimals: 9,
    },
  },
  desmosRpc: "https://rpc.mainnet.desmos.network",
  graphql: {
    endpoint: "http://localhost:8080/graphql",
  },
  authEndpoint: "http://localhost:8080/auth",
  chainLinks: [],
};

const appConfig = window.appConfig;

const Config: IConfig = {
  ...defaultConfig,
  ...appConfig,
};

export default Config;
