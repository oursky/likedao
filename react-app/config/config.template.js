window.appConfig = {
  sentry: null,
  chainInfo: {
    bech32Config: {
      bech32PrefixAccAddr: "like",
      bech32PrefixAccPub: "likepub",
      bech32PrefixValAddr: "likevaloper",
      bech32PrefixValPub: "likevaloperpub",
      bech32PrefixConsAddr: "likevalcons",
      bech32PrefixConsPub: "likevalconspub",
    },
    gasPrice: "10nanolike",
    chainId: "likecoin-mainnet-2",
    chainRpc: "https://mainnet-node.like.co:443/rpc/",
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
  googleAnalyticsId: null,
  chainLinks: [],
  footerLinks: {
    githubLink: "https://github.com/likecoin/likedao",
    tokenLinks: [
      {
        name: "osmosis",
        link: "https://app.osmosis.zone/?from=OSMO&to=LIK",
      },
    ],
    contactSupport:
      "https://go.crisp.chat/chat/embed/?website_id=5c009125-5863-4059-ba65-43f177ca33f7",
  },
};
