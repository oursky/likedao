import React, { useEffect, useMemo, useState } from "react";
import { DesmosClient } from "@desmoslabs/desmjs";
import { StargateClient } from "@cosmjs/stargate";
import Config from "../config/Config";
import {
  ExtendedQueryClient,
  newQueryClient,
  newDesmosQueryClient,
  newStargateClient,
} from "../clients/queryClient";

interface QueryClientProviderProps {
  children?: React.ReactNode;
}

interface QueryClientProviderContextValue {
  query: ExtendedQueryClient;
  desmosQuery: DesmosClient;
  stargateQuery: StargateClient;
}

const QueryClientContext = React.createContext<QueryClientProviderContextValue>(
  null as any
);

const QueryClientProvider: React.FC<QueryClientProviderProps> = (props) => {
  const { children } = props;
  const chainInfo = Config.chainInfo;
  const desmosRpc = Config.desmosRpc;

  const [queryClient, setQueryClient] = useState<ExtendedQueryClient | null>(
    null
  );
  const [desmosQueryClient, setDesmosQueryClient] =
    useState<DesmosClient | null>(null);
  const [stargateClient, setStargateClient] = useState<StargateClient | null>(
    null
  );

  const value = useMemo(
    (): QueryClientProviderContextValue => ({
      query: queryClient!,
      desmosQuery: desmosQueryClient!,
      stargateQuery: stargateClient!,
    }),
    [queryClient, desmosQueryClient, stargateClient]
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
    newDesmosQueryClient(desmosRpc)
      .then((client) => {
        setDesmosQueryClient(client);
      })
      .catch((err) => {
        console.log("Error creating desmos query client", err);
      });
  }, [desmosRpc]);

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
      {queryClient != null && desmosQueryClient != null && children}
    </QueryClientContext.Provider>
  );
};

export default QueryClientProvider;

export const useQueryClient = (): QueryClientProviderContextValue =>
  React.useContext(QueryClientContext);
