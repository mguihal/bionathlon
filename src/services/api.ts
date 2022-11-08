import * as t from 'io-ts';
import { PathReporter, success } from 'io-ts/lib/PathReporter';
import { useCallback, useState } from 'react';
import { useAuth } from './auth';

type DataNotFetched = { readonly _tag: 'dataNotFetched' };
type DataPending = { readonly _tag: 'dataPending' };
type DataFetchedSuccess<T> = { readonly _tag: 'dataFetchedSuccess', data: T };
type DataFetchedError<E> = { readonly _tag: 'dataFetchedError', error: E };
type ApiData<T, E> = DataNotFetched | DataPending | DataFetchedSuccess<T> | DataFetchedError<E>; 

const dataNotFetched: DataNotFetched = { _tag: 'dataNotFetched' };
const dataPending: DataPending = { _tag: 'dataPending' };
const dataSuccess = <T>(data: T): DataFetchedSuccess<T> => ({ _tag: 'dataFetchedSuccess', data });
const dataError = <E>(error: E): DataFetchedError<E> => ({ _tag: 'dataFetchedError', error });

const fold = <T, E>(data: ApiData<T, E>) => <R>(
  success: (value: T) => R,
  error: (error: E) => R,
  notFetched: () => R,
  pending: () => R
) => {
  if (data._tag === 'dataFetchedSuccess') {
    return success(data.data);
  } else if (data._tag === 'dataFetchedError') {
    return error(data.error)
  } else if (data._tag === 'dataNotFetched') {
    return notFetched();
  } else {
    return pending();
  }
};

const BASE_URL = process.env.REACT_APP_API_HOST;

type FoldData<T> = <R>(
  success: (data: T) => R,
  error: (error: Error) => R,
  notFetched: () => R,
  pending: () => R
) => R;

export type ApiHookReturnType<T, QP extends Record<string, string>> = [
  FoldData<T>, 
  (queryParams: QP) => Promise<FoldData<T>>
];

export const useApi = <T, QP extends Record<string, string> = {}>(options: { path: string, schema: t.Any }): ApiHookReturnType<T, QP> => {

  const { getToken, logout } = useAuth();
  const [data, setData] = useState<ApiData<T, Error>>(dataNotFetched);

  const fetchApi = useCallback((queryParams: QP) => {
    let result: ApiData<T, Error> = dataNotFetched;

    const asyncFct = async () => {
      result = dataPending;
      setData(dataPending);
  
      try {
        const qs = (new URLSearchParams(queryParams)).toString();
        const response = await fetch(`${BASE_URL}${options.path}${qs !== '' ? `?${qs}` : ''}`, {
          headers: {
            Authorization: getToken(),
          }
        });
      
        if (response.status === 200) {
          const payload = await response.json();
          const validation = PathReporter.report(options.schema.decode(payload))[0];
      
          if (validation !== success()[0]) {
            throw new Error(`Format de réponse incorrect: ${validation}`);
          }
      
          result = dataSuccess(payload);
          setData(dataSuccess(payload));
        } else if (response.status === 400) {
          throw new Error(`Paramètres de la requête invalides`);
        } else if (response.status === 401) {
          logout(true);
          throw new Error(`Token invalide` || `Vous n'êtes pas autorisé à vous connecter`);
        } else if (response.status === 500) {
          const errorPayload: { error: string } = await response.json();
          throw new Error(errorPayload.error || 'Erreur inconnue');
        } else {
          throw new Error('Erreur inconnue');
        }
      } catch (error) {
        if (error instanceof Error) {
          result = dataError(error);
          setData(dataError(error));
        }
      }

      return fold(result);
    };
    
    return asyncFct();
  }, [options.path, options.schema, getToken, logout]);

  return [fold(data), fetchApi];
};
