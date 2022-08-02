import * as Sentry from "@sentry/react";

export interface ChainLink {
  chainId: string;
  link: string;
}

export interface TokenLink {
  name: string;
  link: string;
}

export interface ChainInfo {
  bech32Config: {
    bech32PrefixAccAddr: string;
    bech32PrefixAccPub: string;
    bech32PrefixValAddr: string;
    bech32PrefixValPub: string;
    bech32PrefixConsAddr: string;
    bech32PrefixConsPub: string;
  };
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
  githubLink: string;
  tokenLinks: TokenLink[];
  contactSupport?: string;
}

export interface IConfig {
  sentry: Pick<
    Sentry.BrowserOptions,
    "dsn" | "environment" | "ignoreErrors"
  > | null;
  chainInfo: ChainInfo;
  graphql: {
    endpoint: string;
  };
  authEndpoint: string;
  googleAnalyticsId: string | null;
  chainLinks: ChainLink[];
  footerLinks: FooterLinks;
}

const defaultConfig: IConfig = {
  sentry: null,
  chainInfo: {
    gasPrice: "200000nanolike",
    bech32Config: {
      bech32PrefixAccAddr: "like",
      bech32PrefixAccPub: "likepub",
      bech32PrefixValAddr: "likevaloper",
      bech32PrefixValPub: "likevaloperpub",
      bech32PrefixConsAddr: "likevalcons",
      bech32PrefixConsPub: "likevalconspub",
    },
    chainId: "",
    chainRpc: "",
    currency: {
      coinDenom: "LIKE",
      coinMinimalDenom: "nanolike",
      coinDecimals: 9,
    },
  },
  graphql: {
    endpoint: "http://localhost:8080/graphql",
  },
  authEndpoint: "http://localhost:8080/auth",
  chainLinks: [],
  googleAnalyticsId: null,
  footerLinks: {
    githubLink: "https://github.com/likecoin/likedao",
    tokenLinks: [
      {
        name: "osmosis",
        link: "https://app.osmosis.zone/?from=ATOM&to=LIKE",
      },
      {
        name: "liquid",
        link: "https://app.liquid.com/exchange/LIKEUSDT",
      },
      {
        name: "emeris",
        link: "https://app.emeris.com/welcome",
      },
    ],
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
