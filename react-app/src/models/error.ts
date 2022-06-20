import { ApolloError } from "@apollo/client";

export const API_INTERNAL_ERROR = "INTERNAL_SERVER_ERROR";
export const API_NOT_FOUND = "NOT_FOUND";
export const API_VALIDATION_FAILURE = "VALIDATION_FAILURE";
export const API_UNKNOWN = "UNKNOWN";
export const API_QUERY_ERROR = "QUERY_ERROR";
export const API_MUTATION_ERROR = "MUTATION_ERROR";
export const API_UNAUTHENTICATED = "UNAUTHENTICATED";

export enum ErrorType {
  Unknown = "Unknown",
  Network = "Network",
  Internal = "Internal",
  Validation = "Validation",
  NotFound = "NotFound",
  Query = "Query",
  Mutation = "Mutation",
  Unauthenticated = "Unauthenticated",
}

export class ServerError extends Error {
  type: ErrorType;
  originalError: Error;

  constructor(type: ErrorType, originalError: any, message?: string) {
    super(
      `${type}: ${message ? message : ""}. Original error: ${JSON.stringify(
        originalError
      )}`
    );
    this.type = type;
    this.originalError = originalError;
  }
}

export class InternalServerError extends ServerError {
  constructor(originalError: any, message?: string) {
    super(ErrorType.Internal, originalError, message);
  }
}

export class NetworkError extends ServerError {
  constructor(originalError: any, message?: string) {
    super(ErrorType.Network, originalError, message);
  }
}

export class ValidationError extends ServerError {
  constructor(originalError: any, message?: string) {
    super(ErrorType.Validation, originalError, message);
  }
}

export class UnknownError extends ServerError {
  constructor(originalError: any, message?: string) {
    super(ErrorType.Unknown, originalError, message);
  }
}

export class QueryError extends ServerError {
  constructor(originalError: any, message?: string) {
    super(ErrorType.Query, originalError, message);
  }
}

export class MutationError extends ServerError {
  constructor(originalError: any, message?: string) {
    super(ErrorType.Mutation, originalError, message);
  }
}

export class NotFoundError extends ServerError {
  constructor(originalError: any, message?: string) {
    super(ErrorType.NotFound, originalError, message);
  }
}

export class UnauthenticatedError extends ServerError {
  constructor(originalError: any, message?: string) {
    super(ErrorType.Unauthenticated, originalError, message);
  }
}

// eslint-disable-next-line complexity
export function parseGraphQLRequestError(error: ApolloError): ServerError {
  if (error.networkError != null) {
    return new NetworkError(error);
  }

  if (error.graphQLErrors.length > 0) {
    const err = error.graphQLErrors[0];
    if (err.extensions.code) {
      switch (err.extensions.code) {
        case API_INTERNAL_ERROR:
          return new InternalServerError(err);
        case API_NOT_FOUND:
          return new NotFoundError(err);
        case API_VALIDATION_FAILURE:
          return new ValidationError(err);
        case API_QUERY_ERROR:
          return new QueryError(err);
        case API_MUTATION_ERROR:
          return new MutationError(err);
        case API_UNAUTHENTICATED:
          return new UnauthenticatedError(err);
        case API_UNKNOWN:
          return new UnknownError(err);
        default:
          break;
      }
    }
  }

  return new UnknownError(error);
}
