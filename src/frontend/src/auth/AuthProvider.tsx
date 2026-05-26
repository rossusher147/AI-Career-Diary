import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { appConfig } from "../config";
import { keycloak } from "./keycloak";

type AuthStatus = "checking" | "authenticated" | "error";

interface AuthContextValue {
  status: AuthStatus;
  errorMessage: string | null;
  getToken: () => Promise<string | undefined>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
let keycloakInitPromise: Promise<boolean> | null = null;

function initialiseKeycloak() {
  if (!keycloakInitPromise) {
    keycloakInitPromise = keycloak.init({
      onLoad: "login-required",
      pkceMethod: "S256",
      checkLoginIframe: false
    });
  }

  return keycloakInitPromise;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initialiseAuth() {
      if (appConfig.mockAuthEnabled) {
        setStatus("authenticated");
        return;
      }

      try {
        const authenticated = await initialiseKeycloak();

        if (!cancelled) {
          setStatus(authenticated ? "authenticated" : "error");
          setErrorMessage(authenticated ? null : "We couldn't finish signing you in. Please try again.");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage("Sign in is temporarily unavailable. Please try again shortly.");
        }
      }
    }

    initialiseAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const getToken = useCallback(async () => {
    if (appConfig.mockAuthEnabled) {
      return "mock-development-token";
    }

    if (!keycloak.authenticated) {
      return undefined;
    }

    try {
      await keycloak.updateToken(30);
      return keycloak.token;
    } catch {
      await keycloak.login();
      return undefined;
    }
  }, []);

  const login = useCallback(async () => {
    if (appConfig.mockAuthEnabled) {
      setStatus("authenticated");
      return;
    }

    await keycloak.login();
  }, []);

  const logout = useCallback(async () => {
    if (appConfig.mockAuthEnabled) {
      setStatus("checking");
      window.location.assign("/");
      return;
    }

    await keycloak.logout({
      redirectUri: window.location.origin
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      errorMessage,
      getToken,
      login,
      logout
    }),
    [errorMessage, getToken, login, logout, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
