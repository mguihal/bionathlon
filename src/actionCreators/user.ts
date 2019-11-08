import { LoginResponse } from '../sagas/api';

export const GOOGLE_LOGIN_SUCCEEDED = 'GOOGLE_LOGIN_SUCCEEDED';
export const GOOGLE_LOGIN_FAILED = 'GOOGLE_LOGIN_FAILED';

export const LOGIN_SUCCEEDED = 'LOGIN_SUCCEEDED';
export const LOGIN_ERROR_UPDATED = 'LOGIN_ERROR_UPDATED';
export const LOGIN_LOGOUT = 'LOGIN_LOGOUT';

export interface GoogleLoginSucceeded {
  type: typeof GOOGLE_LOGIN_SUCCEEDED;
  accessToken: string;
}

export interface GoogleLoginFailed {
  type: typeof GOOGLE_LOGIN_FAILED;
  error: string;
  details: string;
}

export interface LoginSucceeded {
  type: typeof LOGIN_SUCCEEDED;
  token: string;
  user: LoginResponse['user'];
}

export interface LoginErrorUpdated {
  type: typeof LOGIN_ERROR_UPDATED;
  error: string;
}

export interface LoginLogout {
  type: typeof LOGIN_LOGOUT;
  error: string;
}

export type UserAction =
  | GoogleLoginSucceeded
  | GoogleLoginFailed
  | LoginSucceeded
  | LoginErrorUpdated
  | LoginLogout;

export function googleLoginSucceeded(
  accessToken: string,
): GoogleLoginSucceeded {
  return {
    type: GOOGLE_LOGIN_SUCCEEDED,
    accessToken,
  };
}

export function googleLoginFailed(
  error: string,
  details: string,
): GoogleLoginFailed {
  return {
    type: GOOGLE_LOGIN_FAILED,
    error,
    details,
  };
}

export function loginSucceeded(
  token: string,
  user: LoginResponse['user'],
): LoginSucceeded {
  return {
    type: LOGIN_SUCCEEDED,
    token,
    user,
  };
}

export function updateLoginError(error: string) {
  return {
    type: LOGIN_ERROR_UPDATED,
    error,
  };
}

export function logout(error: string) {
  return {
    type: LOGIN_LOGOUT,
    error,
  };
}
