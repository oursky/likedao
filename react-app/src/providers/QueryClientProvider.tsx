import React, { useEffect, useMemo, useState } from "react";
import { StargateClient } from "@cosmjs/stargate";
import Config from "../config/Config";
import {
  ExtendedQueryClient,
  newQueryClient,
  newStargateClient,
} from "../clients/queryClient";

interface QueryClientProviderProps {
  children?: React.ReactNode;
}

interface QueryClientProviderContextValue {
  query: ExtendedQueryClient;
  stargateQuery: StargateClient;
}

const QueryClientContext = React.createContext<QueryClientProviderContextValue>(
  null as any
);

const QueryClientProvider: React.FC<QueryClientProviderProps> = (props) => {
  const { children } = props;
  const chainInfo = Config.chainInfo;

  const [queryClient, setQueryClient] = useState<ExtendedQueryClient | null>(
    null
  );
  const [stargateClient, setStargateClient] = useState<StargateClient | null>(
    null
  );

  const value = useMemo(
    (): QueryClientProviderContextValue => ({
      query: queryClient!,
      stargateQuery: stargateClient!,
    }),
    [queryClient, stargateClient]
  );

  useEffect(() => {
    newQueryClient(chainInfo)
      .then((client) => {
        setQueryClient(client);
      })
      .catch((err) => {
        console.log("Error creating query client", err);
      });
  }, [chainInfo]);

  useEffect(() => {
    newStargateClient(chainInfo)
      .then((client) => {
        setStargateClient(client);
      })
      .catch((err) => {
        console.log("Error creating stargate query client", err);
      });
  }, [chainInfo]);

  return (
    <QueryClientContext.Provider value={value}>
      {queryClient != null && stargateClient != null && children}
    </QueryClientContext.Provider>
  );
};

export default QueryClientProvider;

export const useQueryClient = (): QueryClientProviderContextValue =>
  React.useContext(QueryClientContext);
