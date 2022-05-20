window.keplrChainInfo = {
  chainId: "likecoin-public-testnet-5",
  chainName: "LikeCoin public test chain",
  rpc: "https://likecoin-public-testnet-5.oursky.dev/rpc/",
  rest: "https://likecoin-public-testnet-5.oursky.dev/",
  stakeCurrency: {
    coinDenom: "EKIL",
    coinMinimalDenom: "nanoekil",
    coinDecimals: 9,
    coinGeckoId: "likecoin",
  },
  walletUrlForStaking: "https://stake.like.co",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "like",
    bech32PrefixAccPub: "likepub",
    bech32PrefixValAddr: "likevaloper",
    bech32PrefixValPub: "likevaloperpub",
    bech32PrefixConsAddr: "likevalcons",
    bech32PrefixConsPub: "likevalconspub",
  },
  currencies: [
    {
      coinDenom: "EKIL",
      coinMinimalDenom: "nanoekil",
      coinDecimals: 9,
      coinGeckoId: "likecoin",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "EKIL",
      coinMinimalDenom: "nanoekil",
      coinDecimals: 9,
      coinGeckoId: "likecoin",
    },
  ],
  coinType: 118,
  gasPriceStep: {
    low: 0.01,
    average: 1,
    high: 1000,
  },
  features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
};
