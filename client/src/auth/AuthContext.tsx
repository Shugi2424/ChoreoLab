import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useApolloClient, useQuery } from "@apollo/client";
import { clearStoredToken, getStoredToken, setStoredToken } from "./tokenStorage";
import { ME_QUERY } from "../graphql/queries";
import type { Coach } from "../types/auth";

interface AuthContextValue {
  coach: Coach | null;
  token: string | null;
  bootstrapping: boolean;
  isAuthenticated: boolean;
  loginWithToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const { data, loading, error } = useQuery<{ me: Coach }>(ME_QUERY, {
    skip: !token,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (token && error) {
      clearStoredToken();
      setToken(null);
      void client.clearStore();
    }
  }, [token, error, client]);

  const loginWithToken = useCallback((newToken: string) => {
    setStoredToken(newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(async () => {
    clearStoredToken();
    setToken(null);
    await client.clearStore();
  }, [client]);

  const value = useMemo(
    () => ({
      coach: data?.me ?? null,
      token,
      bootstrapping: Boolean(token) && loading,
      isAuthenticated: Boolean(token),
      loginWithToken,
      logout,
    }),
    [data?.me, token, loading, loginWithToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
