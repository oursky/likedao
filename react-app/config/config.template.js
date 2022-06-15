window.appConfig = {
  sentry: null,
  chainInfo: {
    bech32Prefix: "like",
    gasPrice: "200000nanoekil",
    chainId: "likecoin-public-testnet-5",
    chainRpc: "https://likecoin-public-testnet-5.oursky.dev:443/rpc/",
    currency: {
      coinDenom: "EKIL",
      coinMinimalDenom: "nanoekil",
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
