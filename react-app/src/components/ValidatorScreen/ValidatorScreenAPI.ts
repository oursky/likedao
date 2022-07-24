import { useCallback, useMemo } from "react";
import { RequestState, mapRequestData } from "../../models/RequestState";
import { useLazyGraphQLQuery } from "../../hooks/graphql";
import {
  Sort,
  ValidatorScreenQuery,
  ValidatorScreenQueryQuery,
  ValidatorScreenQueryQueryVariables,
  ValidatorSort,
  ValidatorStatusFilter,
} from "../../generated/graphql";
import { PaginatedValidators } from "./ValidatorScreenModel";

type ValidatorFilter = Omit<
  ValidatorScreenQueryQueryVariables,
  "first" | "after" | "order"
>;

export type FilterKey = "all" | "active" | "inactive";

export enum ValidatorSortableColumn {
  Name = "name",
  VotingPower = "votingPower",
  ExpectedReturns = "expectedReturns",
  Uptime = "uptime",
}

function getValidatorSortOrderVariable(
  order: {
    id: ValidatorSortableColumn;
    direction: "asc" | "desc";
  } | null
): ValidatorSort {
  if (!order) {
    return {};
  }

  const direction = order.direction === "asc" ? Sort.Asc : Sort.Desc;
  switch (order.id) {
    case ValidatorSortableColumn.Name:
      return {
        name: direction,
      };
    case ValidatorSortableColumn.VotingPower:
      return {
        votingPower: direction,
      };
    case ValidatorSortableColumn.ExpectedReturns:
      return {
        expectedReturns: direction,
      };
    case ValidatorSortableColumn.Uptime:
      return {
        uptime: direction,
      };
    default:
      return {};
  }
}

function getValidatorFilterVariables(filter: FilterKey): ValidatorFilter {
  switch (filter) {
    case "all":
      return {};
    case "active":
      return { status: ValidatorStatusFilter.Active };
    case "inactive":
      return { status: ValidatorStatusFilter.Inactive };
    default:
      return {};
  }
}

interface UseValidatorQuery {
  (initialOffset: number, pageSize: number): {
    requestState: RequestState<PaginatedValidators>;
    fetch: (variables: {
      first: number;
      after: number;
      filter: FilterKey;
      order: {
        id: ValidatorSortableColumn;
        direction: "asc" | "desc";
      } | null;
    }) => void;
  };
}

export const useValidatorsQuery: UseValidatorQuery = (
  initialOffset,
  pageSize
) => {
  const [fetch, { requestState }] = useLazyGraphQLQuery<
    ValidatorScreenQueryQuery,
    ValidatorScreenQueryQueryVariables
  >(ValidatorScreenQuery, {
    variables: {
      after: initialOffset,
      first: pageSize,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const callFetch = useCallback(
    ({
      first,
      after,
      filter,
      order,
    }: {
      first: number;
      after: number;
      filter: FilterKey;
      order: {
        id: ValidatorSortableColumn;
        direction: "asc" | "desc";
      } | null;
    }) => {
      // Errors are handled by the requestState
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch({
        variables: {
          first,
          after,
          order: getValidatorSortOrderVariable(order),
          ...getValidatorFilterVariables(filter),
        },
      });
    },
    [fetch]
  );

  const data = useMemo(() => {
    return mapRequestData<ValidatorScreenQueryQuery, PaginatedValidators>(
      requestState,
      (r) => {
        return {
          validators: r.validators.edges.map((validator) => validator.node),
          totalCount: r.validators.totalCount,
        };
      }
    );
  }, [requestState]);

  return {
    fetch: callFetch,
    requestState: data,
  };
};
