import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LoginResponse } from "./user";

const TOKEN_KEY = 'token';

export const useAuth = () => {

  const navigate = useNavigate();

  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY) || '';
  }, []);

  const login = useCallback((token: string, user: any) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('user', JSON.stringify(user));
  }, []);

  const logout = useCallback((expiredSession: boolean) => {
    localStorage.setItem(TOKEN_KEY, '');
    navigate(`/login${expiredSession ? '?expired' : ''}`);
  }, [navigate]);

  const getUser = useCallback((): LoginResponse['user'] => {
    const rawUser = localStorage.getItem('user') || '';
    const fakeUser = { id: 0, name: '', email: '', avatar: null, isAdmin: false };

    try {
      return JSON.parse(rawUser) as LoginResponse['user'];
    } catch (error) {
      logout(true);
      return fakeUser;
    }
  }, [logout]);

  return {
    getToken,
    getUser,
    login,
    logout,
  };
};
