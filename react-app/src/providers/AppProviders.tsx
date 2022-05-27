import React from "react";
import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "../clients/apolloClient";
import AppLocaleProvider from "./AppLocaleProvider";
import WalletProvider from "./WalletProvider";

const apolloClient = createApolloClient();

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = (props) => {
  const { children } = props;

  return (
    <AppLocaleProvider>
      <ApolloProvider client={apolloClient}>
        <WalletProvider>{children}</WalletProvider>
      </ApolloProvider>
    </AppLocaleProvider>
  );
};

export default AppProviders;
