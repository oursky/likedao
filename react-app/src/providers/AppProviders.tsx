import React from "react";
import AppLocaleProvider from "./AppLocaleProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = (props) => {
  const { children } = props;
  return <AppLocaleProvider>{children}</AppLocaleProvider>;
};

export default AppProviders;
