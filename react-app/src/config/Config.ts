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

interface FooterLinks {
  osmosis: string;
  liquid: string;
  emeris: string;
  contactSupport: string;
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
  chainLinks: ChainLink[];
  footerLinks: FooterLinks;
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
  chainLinks: [],
  footerLinks: {
    osmosis: "https://app.osmosis.zone/?from=ATOM&to=LIKE",
    liquid: "https://app.liquid.com/exchange/LIKEUSDT",
    emeris: "https://app.emeris.com/welcome",
    contactSupport:
      "https://go.crisp.chat/chat/embed/?website_id=5c009125-5863-4059-ba65-43f177ca33f7",
  },
};

const appConfig = window.appConfig;

const Config: IConfig = {
  ...defaultConfig,
  ...appConfig,
};

export default Config;
