import * as t from 'io-ts';
import { PathReporter, success } from 'io-ts/lib/PathReporter';
import { useCallback, useState } from 'react';
import { useAuth } from './auth';
import { dataError, dataNotFetched, dataPending, DataResponse, dataSuccess, WrapData, wrap } from './remoteData';

const BASE_URL = process.env.REACT_APP_API_HOST || '';

type ApiOptions = { path: string, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', schema: t.Any, authenticated?: boolean };
type ApiQueryParams =  Record<string, string>;
type ApiPayload = Record<string, any>;
type ApiResponse<T> = WrapData<T, Error>;

type ReturnTypeSimple<T> = [ApiResponse<T>, () => Promise<ApiResponse<T>>];
type ReturnTypeWithQueryParams<T, QP extends ApiQueryParams> = [ApiResponse<T>, (queryParams: QP) => Promise<ApiResponse<T>>];
type ReturnTypeWithQueryParamsAndPayload<T, QP extends ApiQueryParams, P extends ApiPayload> = [ApiResponse<T>, (queryParams: QP, payload: P) => Promise<ApiResponse<T>>];

function useApi<T>(options: ApiOptions): ReturnTypeSimple<T>;
function useApi<T, QP extends ApiQueryParams>(options: ApiOptions): ReturnTypeWithQueryParams<T, QP>;
function useApi<T, QP extends ApiQueryParams, P extends ApiPayload>(options: ApiOptions): ReturnTypeWithQueryParamsAndPayload<T, QP, P>;

function useApi<T, QP extends ApiQueryParams = {}, P extends ApiPayload = {}>(
  options: ApiOptions
): ReturnTypeSimple<T> | ReturnTypeWithQueryParams<T, QP> | ReturnTypeWithQueryParamsAndPayload<T, QP, P> {

  const { getToken, logout } = useAuth();
  const [data, setData] = useState<DataResponse<T, Error>>(dataNotFetched);

  const fetchApi = useCallback((queryParams?: QP, payload?: P) => {
    let result: DataResponse<T, Error> = dataNotFetched;

    const asyncFct = async () => {
      result = dataPending;
      setData(dataPending);
  
      try {        
        const qs = (new URLSearchParams(queryParams || {})).toString();
        const response = await fetch(`${BASE_URL}${options.path}${qs !== '' ? `?${qs}` : ''}`, {
          method: options.method || 'GET',
          headers: {
            Authorization: options.authenticated === false ? '' : getToken(),
          },
          body: payload ? JSON.stringify(payload) : null,
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
          throw new Error(options.authenticated === false ? `Vous n'êtes pas autorisé à vous connecter` : `Token invalide`);
        } else if (response.status === 500) {
          const errorPayload: { error: string } = await response.json();
          throw new Error(errorPayload.error || 'Erreur inconnue');
        } else {
          throw new Error('Erreur inconnue');
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
          result = dataError(error);
          setData(dataError(error));
        }
      }

      return wrap(result);
    };
    
    return asyncFct();
  }, [options.path, options.schema, options.method, options.authenticated, getToken, logout]);

  return [wrap(data), fetchApi];
}

export {
  useApi,
};
