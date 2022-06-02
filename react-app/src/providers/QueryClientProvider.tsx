import React, { useEffect, useMemo, useState } from "react";
import Config from "../config/Config";
import { ExtendedQueryClient, newQueryClient } from "../clients/queryClient";

interface QueryClientProviderProps {
  children?: React.ReactNode;
}

interface QueryClientProviderContextValue {
  query: ExtendedQueryClient;
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

  const value = useMemo(
    (): QueryClientProviderContextValue => ({
      query: queryClient!,
    }),
    [queryClient]
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

  return (
    <QueryClientContext.Provider value={value}>
      {!!queryClient && children}
    </QueryClientContext.Provider>
  );
};

export default QueryClientProvider;

export const useQueryClient = (): QueryClientProviderContextValue =>
  React.useContext(QueryClientContext);
