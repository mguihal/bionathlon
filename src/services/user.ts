import z from 'zod';
import { useApi } from './api';

export const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    avatar: z.nullable(z.string()),
    isAdmin: z.boolean(),
  }),
});

export const loginPayloadSchema = z.object({
  data: z.object({
    googleToken: z.string(),
  }),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LoginPayload = z.infer<typeof loginPayloadSchema>;

export const useLogin = (): ReturnType<typeof useApi<LoginResponse, Record<string, never>, LoginPayload>> => {
  const [responseData, fetchApi] = useApi<LoginResponse, Record<string, never>, LoginPayload>({
    path: '/api/login',
    method: 'POST',
    schema: loginResponseSchema,
    authenticated: false,
  });

  return [responseData, fetchApi];
};
