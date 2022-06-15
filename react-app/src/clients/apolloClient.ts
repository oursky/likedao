import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  ApolloLink,
  HttpLink,
} from "@apollo/client";
import { withScalars } from "apollo-link-scalars";
import BigNumber from "bignumber.js";
import {
  buildClientSchema,
  GraphQLScalarType,
  IntrospectionQuery,
} from "graphql";
import Config from "../config/Config";
import introspection from "../generated/graphql.schema.json";

const typePolicies = {};
const scalars: Record<string, GraphQLScalarType> = {
  BigInt: new GraphQLScalarType({
    name: "BigInt",
    serialize: (parsed: unknown): string | null => {
      return parsed instanceof BigNumber ? parsed.toFixed() : null;
    },
    parseValue: (value: unknown): BigNumber | null => {
      if (value == null) return null;
      if (typeof value === "string" || typeof value === "number") {
        return new BigNumber(value);
      }

      throw new Error(`Cannot parse value as BigInt`);
    },
  }),
  BigFloat: new GraphQLScalarType({
    name: "BigFloat",
    serialize: (parsed: unknown): string | null => {
      return parsed instanceof BigNumber ? parsed.toFixed() : null;
    },
    parseValue: (value: unknown): BigNumber | null => {
      if (value == null) return null;
      if (typeof value === "string" || typeof value === "number") {
        return new BigNumber(value);
      }

      throw new Error(`Cannot parse value as BigFloat`);
    },
  }),
};

const schema = buildClientSchema(
  introspection as unknown as IntrospectionQuery
);

const link = ApolloLink.from([
  withScalars({ schema, typesMap: scalars }),
  new HttpLink({ uri: Config.graphql.endpoint, credentials: "include" }),
]);

export const createApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  return new ApolloClient({
    link,
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
