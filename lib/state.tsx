"use client";

import { useEffect } from "react";
import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { Provider, useDispatch, useSelector } from "react-redux";
import { authClient, AuthClientError } from "@/lib/auth-client";
import type { AuthFailure, AuthState, UseAuthReturn, User } from "@/types";
import { LIVE_UPDATE_CLIENT_ID, serverApi } from "./api";

const initialAuthState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  lastVerifiedAt: null,
};

function getAuthFailure(error: unknown): AuthFailure {
  if (error instanceof AuthClientError) {
    return { message: error.message, kind: error.kind };
  }
  return {
    message: error instanceof Error ? error.message : "Authentication failed",
    kind: "server",
  };
}

const authState = createSlice({
  name: "authentication",
  initialState: initialAuthState,
  reducers: {
    checkingSession(state) {
      if (!state.user) state.status = "checking";
      state.error = null;
    },
    sessionLoaded(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "anonymous";
      state.error = null;
      state.lastVerifiedAt = Date.now();
    },
    sessionFailed(state, action: PayloadAction<AuthFailure>) {
      state.error = action.payload.message;
      state.status = state.user
        ? "authenticated"
        : action.payload.kind === "validation"
          ? "anonymous"
          : "offline";
    },
    clearSession(state) {
      state.user = null;
      state.status = "anonymous";
      state.error = null;
      state.lastVerifiedAt = Date.now();
    },
  },
});

const { checkingSession, sessionLoaded, sessionFailed, clearSession } = authState.actions;

const applicationState = configureStore({
  reducer: {
    authentication: authState.reducer,
    [serverApi.reducerPath]: serverApi.reducer,
  },
  middleware: (defaults) => defaults().concat(serverApi.middleware),
});
setupListeners(applicationState.dispatch);

type ApplicationDispatch = typeof applicationState.dispatch;

const useApplicationDispatch = useDispatch.withTypes<ApplicationDispatch>();
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

async function verifySession(dispatch: ApplicationDispatch) {
  dispatch(checkingSession());
  try {
    const { user } = await authClient.getSession();
    dispatch(sessionLoaded(user));
  } catch (error) {
    dispatch(sessionFailed(getAuthFailure(error)));
  }
}

export function ApplicationProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void verifySession(applicationState.dispatch);

    const stopAuthenticationSync = authClient.subscribe((event) => {
      applicationState.dispatch(serverApi.util.resetApiState());
      if (event.type === "signed-out") applicationState.dispatch(clearSession());
      else void verifySession(applicationState.dispatch);
    });

    function verifyVisibleSession() {
      const verifiedAt = applicationState.getState().authentication.lastVerifiedAt;
      const expired = !verifiedAt || Date.now() - verifiedAt > 5 * 60_000;
      if (document.visibilityState === "visible" && expired) {
        void verifySession(applicationState.dispatch);
      }
    }
    document.addEventListener("visibilitychange", verifyVisibleSession);

    const updates = API_URL
      ? new EventSource(
          `${API_URL}/api/events?clientId=${encodeURIComponent(LIVE_UPDATE_CLIENT_ID)}`,
          { withCredentials: true }
        )
      : null;

    if (updates) {
      let connected = false;
      updates.onopen = () => {
        if (connected) {
          applicationState.dispatch(
            serverApi.util.invalidateTags(["Activity", "Organization", "User", "Dashboard"])
          );
        }
        connected = true;
      };
      updates.addEventListener("changed", (message) => {
        try {
          const resource = JSON.parse((message as MessageEvent<string>).data).resource;
          if (resource === "activity") {
            applicationState.dispatch(serverApi.util.invalidateTags(["Activity", "Dashboard"]));
          } else if (resource === "organization") {
            applicationState.dispatch(
              serverApi.util.invalidateTags(["Organization", "Dashboard", "User"])
            );
          } else if (resource === "user") {
            applicationState.dispatch(serverApi.util.invalidateTags(["User", "Dashboard"]));
          }
        } catch {
          // Ignore malformed server notifications.
        }
      });
    }

    return () => {
      stopAuthenticationSync();
      document.removeEventListener("visibilitychange", verifyVisibleSession);
      updates?.close();
    };
  }, []);

  return <Provider store={applicationState}>{children}</Provider>;
}

export function useAuth(): UseAuthReturn {
  const dispatch = useApplicationDispatch();
  const state = useSelector((application: { authentication: AuthState }) => application.authentication);

  async function login(email: string, password: string) {
    try {
      const { user } = await authClient.signIn({ email, password });
      dispatch(sessionLoaded(user));
      dispatch(serverApi.util.resetApiState());
      return user;
    } catch (error) {
      dispatch(sessionFailed(getAuthFailure(error)));
      throw error;
    }
  }

  async function logout() {
    try {
      await authClient.signOut();
      dispatch(clearSession());
      dispatch(serverApi.util.resetApiState());
    } catch (error) {
      dispatch(sessionFailed(getAuthFailure(error)));
      throw error;
    }
  }

  async function changePassword(current: string, next: string) {
    await authClient.changePassword(current, next);
    dispatch(clearSession());
    dispatch(serverApi.util.resetApiState());
  }

  async function refetch() {
    await verifySession(dispatch);
  }

  return {
    user: state.user,
    isPending: state.status === "idle" || state.status === "checking",
    isOffline: state.status === "offline",
    error: state.error,
    login,
    logout,
    changePassword,
    refetch,
  };
}
