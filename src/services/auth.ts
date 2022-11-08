import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = 'token';

export const useAuth = () => {

  const navigate = useNavigate();

  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY) || '';
  }, []);

  const logout = useCallback((expiredSession: boolean) => {
    localStorage.setItem(TOKEN_KEY, '');
    navigate(`/login${expiredSession ? '?expired' : ''}`);
  }, [navigate]);

  return {
    getToken,
    logout,
  };
};
