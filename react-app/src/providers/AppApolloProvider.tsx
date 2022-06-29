import React, { useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import {
  buildClientSchema,
  GraphQLScalarType,
  IntrospectionQuery,
} from "graphql";
import { onError } from "@apollo/link-error";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  Observable,
  PossibleTypesMap,
} from "@apollo/client";
import { withScalars } from "apollo-link-scalars";
import { toast } from "react-toastify";
import Config from "../config/Config";
import introspection from "../generated/graphql.schema.json";
import { API_UNAUTHENTICATED } from "../models/error";
import { useAuth } from "./AuthProvider";
import { useLocale } from "./AppLocaleProvider";

const typePolicies = {};
const possibleTypes: PossibleTypesMap = {
  ProposalVoter: ["Validator", "StringObject"],
};
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

interface AppApolloProviderProps {
  children?: React.ReactNode;
}

const AppApolloProvider: React.FC<AppApolloProviderProps> = (props) => {
  const { children } = props;
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const auth = useAuth();
  const { translate } = useLocale();

  const authErrorLink = useMemo(() => {
    // eslint-disable-next-line consistent-return
    return onError(({ graphQLErrors, operation, forward }) => {
      if (!isLoggingIn && graphQLErrors && graphQLErrors.length > 0) {
        const error = graphQLErrors[0];
        if (error.extensions.code === API_UNAUTHENTICATED) {
          setIsLoggingIn(true);
          return new Observable((observer) => {
            auth
              .signInWithCosmos()
              .then(() => {
                forward(operation).subscribe(observer);
              })
              .catch((error) => {
                toast.error(translate("auth.loginFailure"));
                observer.error(error);
              })
              .finally(() => {
                setIsLoggingIn(false);
              });
          });
        }
      }
    });
  }, [auth, isLoggingIn, translate]);

  const link = useMemo(() => {
    return ApolloLink.from([
      withScalars({ schema, typesMap: scalars }),
      // @ts-expect-error expected invalid type
      authErrorLink,
      new HttpLink({ uri: Config.graphql.endpoint, credentials: "include" }),
    ]);
  }, [authErrorLink]);

  const client = useMemo(() => {
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
        possibleTypes,
      }),
    });
  }, [link]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default AppApolloProvider;
