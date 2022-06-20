import React from "react";
import AppLocaleProvider from "./AppLocaleProvider";
import WalletProvider from "./WalletProvider";
import TransactionProvider from "./TransactionProvider";
import QueryClientProvider from "./QueryClientProvider";
import AuthProvider from "./AuthProvider";
import AppApolloProvider from "./AppApolloProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = (props) => {
  const { children } = props;

  return (
    <AppLocaleProvider>
      <WalletProvider>
        <QueryClientProvider>
          <TransactionProvider>
            <AuthProvider>
              <AppApolloProvider>{children}</AppApolloProvider>
            </AuthProvider>
          </TransactionProvider>
        </QueryClientProvider>
      </WalletProvider>
    </AppLocaleProvider>
  );
};

export default AppProviders;
