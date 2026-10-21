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
import { warmApiConnection } from "../utils/apiWarmup";

interface AuthContextValue {
  coach: Coach | null;
  token: string | null;
  bootstrapping: boolean;
  isAuthenticated: boolean;
  loginWithToken: (token: string, coach?: Coach) => void;
  logout: () => void;
  refetchCoach: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [sessionCoach, setSessionCoach] = useState<Coach | null>(null);

  useEffect(() => {
    if (getStoredToken()) {
      warmApiConnection();
    }
  }, []);

  const handleSessionError = useCallback(async () => {
    clearStoredToken();
    setToken(null);
    setSessionCoach(null);
    await client.clearStore();
  }, [client]);

  const { data, loading, refetch } = useQuery<{ me: Coach }>(ME_QUERY, {
    skip: !token,
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: false,
    onError: () => {
      void handleSessionError();
    },
  });

  const loginWithToken = useCallback(
    (newToken: string, coach?: Coach) => {
      setStoredToken(newToken);
      setToken(newToken);
      if (coach) {
        setSessionCoach(coach);
        client.writeQuery({ query: ME_QUERY, data: { me: coach } });
      }
    },
    [client],
  );

  const logout = useCallback(async () => {
    clearStoredToken();
    setToken(null);
    setSessionCoach(null);
    await client.clearStore();
  }, [client]);

  const refetchCoach = useCallback(async () => {
    if (token) {
      await refetch();
    }
  }, [token, refetch]);

  const coach = data?.me ?? sessionCoach;

  const value = useMemo(
    () => ({
      coach,
      token,
      bootstrapping: Boolean(token) && loading && !coach,
      isAuthenticated: Boolean(token),
      loginWithToken,
      logout,
      refetchCoach,
    }),
    [coach, token, loading, loginWithToken, logout, refetchCoach],
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
