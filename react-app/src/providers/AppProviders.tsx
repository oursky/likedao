import React from "react";
import AppLocaleProvider from "./AppLocaleProvider";
import WalletProvider from "./WalletProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = (props) => {
  const { children } = props;

  return (
    <AppLocaleProvider>
      <WalletProvider>{children}</WalletProvider>
    </AppLocaleProvider>
  );
};

export default AppProviders;
