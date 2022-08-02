import React, { useEffect, useState } from "react";
import * as ReactGA from "react-ga";
import { useLocation } from "react-router-dom";
import Config from "../config/Config";

interface AnalyticsProviderProps {
  children?: React.ReactNode;
}

const AnalyticsContext = React.createContext(null as any);

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = (props) => {
  const { children } = props;
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    if (!isInitialized) return;

    ReactGA.pageview(location.pathname + location.search);
  }, [isInitialized, location]);

  useEffect(() => {
    if (Config.googleAnalyticsId) {
      ReactGA.initialize(Config.googleAnalyticsId);
    }
    setIsInitialized(true);
  }, []);

  return (
    <AnalyticsContext.Provider value={null}>
      {isInitialized && children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;
