export type RequestState<T> =
  | IRequestStateInitial
  | IRequestStateLoading
  | IRequestStateLoaded<T>
  | IRequestStateError;

export enum RequestStateType {
  Initial = 0,
  Loading = 1,
  Loaded = 2,
  Error = 3,
}

export interface IRequestStateInitial {
  type: RequestStateType.Initial;
}
export const RequestStateInitial: IRequestStateInitial = {
  type: RequestStateType.Initial,
};
export function isRequestStateInitial<T>(
  requestState: RequestState<T>
): requestState is IRequestStateInitial {
  return requestState.type === RequestStateType.Initial;
}

export interface IRequestStateLoading {
  type: RequestStateType.Loading;
}
export const RequestStateLoading: IRequestStateLoading = {
  type: RequestStateType.Loading,
};
export function isRequestStateLoading<T>(
  requestState: RequestState<T>
): requestState is IRequestStateLoading {
  return requestState.type === RequestStateType.Loading;
}

export interface IRequestStateLoaded<T> {
  type: RequestStateType.Loaded;
  data: T;
}
export function RequestStateLoaded<T>(data: T): IRequestStateLoaded<T> {
  return {
    type: RequestStateType.Loaded,
    data,
  };
}
export function isRequestStateLoaded<T>(
  requestState: RequestState<T>
): requestState is IRequestStateLoaded<T> {
  return requestState.type === RequestStateType.Loaded;
}

export interface IRequestStateError {
  type: RequestStateType.Error;
  error: Error;
}
export function RequestStateError(error: Error): IRequestStateError {
  return {
    type: RequestStateType.Error,
    error,
  };
}
export function isRequestStateError<T>(
  requestState: RequestState<T>
): requestState is IRequestStateError {
  return requestState.type === RequestStateType.Error;
}

export function mapRequestData<T, U>(
  state: RequestState<T>,
  fmap: (v: T) => U
): RequestState<U> {
  if (state.type !== RequestStateType.Loaded) {
    return state;
  }
  return RequestStateLoaded(fmap(state.data));
}
