import { useEffect, useMemo, useCallback } from "react";
import {
  QueryHookOptions,
  LazyQueryHookOptions,
  QueryTuple,
  useLazyQuery,
  NetworkStatus,
  MutationHookOptions,
  MutationFunctionOptions,
  useMutation,
  ApolloError,
} from "@apollo/client";
import { DocumentNode } from "graphql";
import {
  RequestState,
  RequestStateLoading,
  RequestStateLoaded,
  RequestStateError,
  RequestStateInitial,
} from "../models/RequestState";

export function useGraphQLQuery<TData = never, TVariables = never>(
  query: DocumentNode,
  options?: TVariables extends never
    ? undefined
    : QueryHookOptions<TData, TVariables>
): RequestState<TData> {
  const [execute, { requestState }] = useLazyGraphQLQuery(query, options);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    execute();
  }, [execute]);
  return requestState;
}

export function useLazyGraphQLQuery<TData = never, TVariables = never>(
  query: DocumentNode,
  options?: LazyQueryHookOptions<TData, TVariables>
): [
  QueryTuple<TData, TVariables>[0],
  {
    requestState: RequestState<TData>;
    fetchMore: QueryTuple<TData, TVariables>[1]["fetchMore"];
    refetch: QueryTuple<TData, TVariables>[1]["refetch"];
  }
] {
  const [execute, { loading, error, data, fetchMore, refetch, networkStatus }] =
    useLazyQuery<TData, TVariables>(query, options);

  const requestState = useMemo<RequestState<TData>>(() => {
    if (networkStatus === NetworkStatus.refetch) {
      return RequestStateLoading;
    }
    if (data !== undefined) {
      return RequestStateLoaded(data);
    }
    if (error !== undefined) {
      return RequestStateError(error);
    }
    if (loading) {
      return RequestStateLoading;
    }
    return RequestStateInitial;
  }, [loading, error, data, networkStatus]);

  return [
    execute,
    {
      requestState,
      fetchMore,
      refetch,
    },
  ];
}

export function useGraphQLMutation<TData = never, TVariables = never>(
  mutation: DocumentNode,
  options?: MutationHookOptions<TData, TVariables>
): (options?: MutationFunctionOptions<TData, TVariables>) => Promise<TData> {
  const [execute] = useMutation<TData, TVariables>(mutation, options);
  return useCallback(
    async (
      mutationOptions?: MutationFunctionOptions<TData, TVariables>
    ): Promise<TData> => {
      const result = await execute(mutationOptions);
      const error = (result as any).error as ApolloError | undefined;
      if (error !== undefined) {
        throw error;
      }
      return result.data as TData;
    },
    [execute]
  );
}
