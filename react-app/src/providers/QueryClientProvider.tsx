import React, { useEffect, useMemo, useState } from "react";
import { DesmosClient } from "@desmoslabs/desmjs";
import { StargateClient } from "@cosmjs/stargate";
import Config from "../config/Config";
import {
  ExtendedQueryClient,
  newQueryClient,
  newDesmosQueryClient,
  newStargateQueryClient,
} from "../clients/queryClient";

interface QueryClientProviderProps {
  children?: React.ReactNode;
}

interface QueryClientProviderContextValue {
  query: ExtendedQueryClient;
  stargateQuery: StargateClient;
  desmosQuery: DesmosClient;
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
  const [stargateQueryClient, setStargateQueryClient] =
    useState<StargateClient | null>(null);
  const [desmosQueryClient, setDesmosQueryClient] =
    useState<DesmosClient | null>(null);

  const value = useMemo(
    (): QueryClientProviderContextValue => ({
      query: queryClient!,
      stargateQuery: stargateQueryClient!,
      desmosQuery: desmosQueryClient!,
    }),
    [queryClient, stargateQueryClient, desmosQueryClient]
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
    newStargateQueryClient(chainInfo)
      .then((client) => {
        setStargateQueryClient(client);
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

  return (
    <QueryClientContext.Provider value={value}>
      {queryClient != null && desmosQueryClient != null && children}
    </QueryClientContext.Provider>
  );
};

export default QueryClientProvider;

export const useQueryClient = (): QueryClientProviderContextValue =>
  React.useContext(QueryClientContext);
