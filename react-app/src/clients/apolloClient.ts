import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import Config from "../config/Config";

const typePolicies = {};

export const createApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  const config = Config.graphql;
  return new ApolloClient({
    uri: config.endpoint,
    defaultOptions: {
      query: {
        fetchPolicy: "cache-first",
      },
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
    cache: new InMemoryCache({
      typePolicies,
    }),
  });
};
