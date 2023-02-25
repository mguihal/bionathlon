import * as t from 'io-ts';
import { nullable } from 'io-ts/lib/Type';
import { useApi } from './api';

export const loginResponseSchema = t.type({
  token: t.string,
  user: t.type({
    id: t.number,
    email: t.string,
    name: t.string,
    avatar: nullable(t.string),
    isAdmin: t.boolean,
  }),
});

export const loginPayloadSchema = t.type({
  data: t.type({
    googleToken: t.string,
  }),
});

export type LoginResponse = t.TypeOf<typeof loginResponseSchema>;
export type LoginPayload = t.TypeOf<typeof loginPayloadSchema>;

export const useLogin = (): ReturnType<typeof useApi<LoginResponse, Record<string, never>, LoginPayload>> => {
  const [responseData, fetchApi] = useApi<LoginResponse, Record<string, never>, LoginPayload>({
    path: '/api/login',
    method: 'POST',
    schema: loginResponseSchema,
    authenticated: false,
  });

  return [responseData, fetchApi];
};
