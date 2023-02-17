type DataNotFetched = { readonly _tag: 'dataNotFetched' };
type DataPending = { readonly _tag: 'dataPending' };
type DataFetchedSuccess<T> = { readonly _tag: 'dataFetchedSuccess'; data: T };
type DataFetchedError<E> = { readonly _tag: 'dataFetchedError'; error: E };
export type DataResponse<T, E> = DataNotFetched | DataPending | DataFetchedSuccess<T> | DataFetchedError<E>;

export type WrapData<T, E> = {
  fold: <R>(success: (data: T) => R, error: (error: E) => R, notFetched: () => R, pending?: () => R) => R;
  getOrElse: <R>(other: R) => T | R;
  isSuccess: () => boolean;
  isError: () => boolean;
};

export const dataNotFetched: DataNotFetched = { _tag: 'dataNotFetched' };
export const dataPending: DataPending = { _tag: 'dataPending' };
export const dataSuccess = <T>(data: T): DataFetchedSuccess<T> => ({
  _tag: 'dataFetchedSuccess',
  data,
});
export const dataError = <E>(error: E): DataFetchedError<E> => ({
  _tag: 'dataFetchedError',
  error,
});

const fold =
  <T, E>(data: DataResponse<T, E>) =>
  <R>(success: (value: T) => R, error: (error: E) => R, notFetched: () => R, pending?: () => R) => {
    if (data._tag === 'dataFetchedSuccess') {
      return success(data.data);
    } else if (data._tag === 'dataFetchedError') {
      return error(data.error);
    } else if (data._tag === 'dataNotFetched') {
      return notFetched();
    } else {
      return pending?.() || notFetched();
    }
  };

export const wrap = <T, E>(data: DataResponse<T, E>): WrapData<T, E> => {
  return {
    fold: fold(data),
    getOrElse: <R>(other: R) =>
      fold(data)<T | R>(
        (p) => p,
        () => other,
        () => other,
        () => other,
      ),
    isSuccess: () => data._tag === 'dataFetchedSuccess',
    isError: () => data._tag === 'dataFetchedError',
  };
};
