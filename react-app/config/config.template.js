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
