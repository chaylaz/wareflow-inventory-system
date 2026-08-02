import axios from "axios";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_SESSION_EXPIRED_MESSAGE,
  clearStoredAuthNotice,
  getStoredAuthNotice,
} from "../lib/authEvents";

import { api } from "../lib/api";

import type {
  AuthenticatedUser,
  LoginRequest,
} from "../types/auth";

type AuthContextValue = {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authNotice: string | null;

  login: (
    request: LoginRequest
  ) => Promise<AuthenticatedUser>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;

  clearAuthNotice: () => void;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthenticatedUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [authNotice, setAuthNotice] =
    useState<string | null>(() =>
      getStoredAuthNotice()
    );

  const clearAuthNotice =
    useCallback(() => {
      setAuthNotice(null);
      clearStoredAuthNotice();
    }, []);

  const refreshUser =
    useCallback(async () => {
      try {
        const response =
          await api.get<AuthenticatedUser>(
            "/api/auth/me"
          );

        setUser(response.data);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          setUser(null);
          return;
        }

        throw error;
      }
    }, []);

  useEffect(() => {
    function handleSessionExpired(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<string>;

      const notice =
        customEvent.detail ||
        getStoredAuthNotice() ||
        AUTH_SESSION_EXPIRED_MESSAGE;

      setAuthNotice(notice);
      setUser(null);
    }

    window.addEventListener(
      AUTH_SESSION_EXPIRED_EVENT,
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired
      );
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuthentication() {
      try {
        await refreshUser();
      } catch (error) {
        console.error(
          "Failed to initialize authentication:",
          error
        );

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void initializeAuthentication();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const login = useCallback(
    async (
      request: LoginRequest
    ): Promise<AuthenticatedUser> => {
      const response =
        await api.post<AuthenticatedUser>(
          "/api/auth/login",
          request
        );

      setUser(response.data);
      setAuthNotice(null);
      clearStoredAuthNotice();

      return response.data;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
      setAuthNotice(null);
      clearStoredAuthNotice();
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      authNotice,
      login,
      logout,
      refreshUser,
      clearAuthNotice,
    }),
    [
      user,
      isLoading,
      authNotice,
      login,
      logout,
      refreshUser,
      clearAuthNotice,
    ]
  );

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}