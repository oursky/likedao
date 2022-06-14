import React, { useEffect, useMemo, useState } from "react";
import { DesmosClient } from "@desmoslabs/desmjs";
import Config from "../config/Config";
import {
  ExtendedQueryClient,
  newQueryClient,
  newDesmosQueryClient,
} from "../clients/queryClient";

interface QueryClientProviderProps {
  children?: React.ReactNode;
}

interface QueryClientProviderContextValue {
  query: ExtendedQueryClient;
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
  const [desmosQueryClient, setDesmosQueryClient] =
    useState<DesmosClient | null>(null);

  const value = useMemo(
    (): QueryClientProviderContextValue => ({
      query: queryClient!,
      desmosQuery: desmosQueryClient!,
    }),
    [queryClient, desmosQueryClient]
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

  return (
    <QueryClientContext.Provider value={value}>
      {queryClient != null && desmosQueryClient != null && children}
    </QueryClientContext.Provider>
  );
};

export default QueryClientProvider;

export const useQueryClient = (): QueryClientProviderContextValue =>
  React.useContext(QueryClientContext);
