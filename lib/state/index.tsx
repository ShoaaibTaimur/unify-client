"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { Provider, useDispatch, useSelector } from "react-redux";
import { authClient, AuthClientError } from "@/lib/auth-client";
import type { AuthFailure, AuthState, LoginCredentials, UseAuthReturn, User } from "@/types";
import { LIVE_UPDATE_CLIENT_ID, serverApi } from "./server-api";

const initialAuthentication: AuthState = {
  user: null,
  status: "idle",
  error: null,
  lastVerifiedAt: null,
};

function authenticationFailure(error: unknown): AuthFailure {
  if (error instanceof AuthClientError) {
    return { message: error.message, kind: error.kind, status: error.status, code: error.code };
  }
  return {
    message: error instanceof Error ? error.message : "Authentication failed",
    kind: "server",
  };
}

const loadSession = createAsyncThunk<User | null, void, { rejectValue: AuthFailure }>(
  "authentication/loadSession",
  async (_, { rejectWithValue }) => {
    try {
      return (await authClient.getSession()).user;
    } catch (error) {
      return rejectWithValue(authenticationFailure(error));
    }
  }
);

const signIn = createAsyncThunk<User, LoginCredentials, { rejectValue: AuthFailure }>(
  "authentication/signIn",
  async (credentials, { rejectWithValue }) => {
    try {
      return (await authClient.signIn(credentials)).user;
    } catch (error) {
      return rejectWithValue(authenticationFailure(error));
    }
  }
);

const signOut = createAsyncThunk<void, void, { rejectValue: AuthFailure }>(
  "authentication/signOut",
  async (_, { rejectWithValue }) => {
    try {
      await authClient.signOut();
    } catch (error) {
      return rejectWithValue(authenticationFailure(error));
    }
  }
);

const authentication = createSlice({
  name: "authentication",
  initialState: initialAuthentication,
  reducers: {
    clearSession(state) {
      state.user = null;
      state.status = "anonymous";
      state.error = null;
      state.lastVerifiedAt = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSession.pending, (state) => {
        if (!state.user) state.status = "checking";
        state.error = null;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? "authenticated" : "anonymous";
        state.error = null;
        state.lastVerifiedAt = Date.now();
      })
      .addCase(loadSession.rejected, (state, action) => {
        state.error = action.payload?.message ?? "Unable to verify session";
        state.status = state.user ? "authenticated" : "offline";
      })
      .addCase(signIn.pending, (state) => {
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
        state.error = null;
        state.lastVerifiedAt = Date.now();
      })
      .addCase(signIn.rejected, (state, action) => {
        state.error = action.payload?.message ?? "Login failed";
        if (!state.user) state.status = action.payload?.kind === "validation" ? "anonymous" : "offline";
      })
      .addCase(signOut.pending, (state) => {
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.status = "anonymous";
        state.error = null;
        state.lastVerifiedAt = Date.now();
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = action.payload?.message ?? "Logout failed";
      });
  },
});

const { clearSession } = authentication.actions;

function createApplicationState() {
  const state = configureStore({
    reducer: {
      authentication: authentication.reducer,
      [serverApi.reducerPath]: serverApi.reducer,
    },
    middleware: (defaults) => defaults().concat(serverApi.middleware),
  });
  setupListeners(state.dispatch);
  return state;
}

type ApplicationState = ReturnType<ReturnType<typeof createApplicationState>["getState"]>;
type ApplicationDispatch = ReturnType<typeof createApplicationState>["dispatch"];

const useApplicationDispatch = useDispatch.withTypes<ApplicationDispatch>();
const useApplicationSelector = useSelector.withTypes<ApplicationState>();
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

function SessionManager({ children }: { children: React.ReactNode }) {
  const dispatch = useApplicationDispatch();
  const lastVerifiedAt = useApplicationSelector((state) => state.authentication.lastVerifiedAt);
  const lastVerifiedAtRef = useRef(lastVerifiedAt);
  lastVerifiedAtRef.current = lastVerifiedAt;

  useEffect(() => {
    void dispatch(loadSession());
    const stopAuthenticationSync = authClient.subscribe((event) => {
      dispatch(serverApi.util.resetApiState());
      if (event.type === "signed-out") dispatch(clearSession());
      else void dispatch(loadSession());
    });
    const verifyVisibleSession = () => {
      const verifiedAt = lastVerifiedAtRef.current;
      const expired = !verifiedAt || Date.now() - verifiedAt > 5 * 60_000;
      if (document.visibilityState === "visible" && expired) void dispatch(loadSession());
    };
    document.addEventListener("visibilitychange", verifyVisibleSession);

    const updates = API_URL && typeof EventSource !== "undefined"
      ? new EventSource(
          `${API_URL}/api/events?clientId=${encodeURIComponent(LIVE_UPDATE_CLIENT_ID)}`,
          { withCredentials: true }
        )
      : null;
    if (updates) {
      let connected = false;
      updates.onopen = () => {
        if (connected) dispatch(serverApi.util.invalidateTags(["Activity", "Organization", "User", "Dashboard"]));
        connected = true;
      };
      updates.addEventListener("changed", (message) => {
        try {
          const resource = JSON.parse((message as MessageEvent<string>).data).resource;
          if (resource === "activity") dispatch(serverApi.util.invalidateTags(["Activity", "Dashboard"]));
          if (resource === "organization") dispatch(serverApi.util.invalidateTags(["Organization", "Dashboard", "User"]));
          if (resource === "user") dispatch(serverApi.util.invalidateTags(["User", "Dashboard"]));
        } catch {
          // Ignore malformed notifications.
        }
      });
    }

    return () => {
      stopAuthenticationSync();
      document.removeEventListener("visibilitychange", verifyVisibleSession);
      updates?.close();
    };
  }, [dispatch]);

  return children;
}

export function ApplicationProviders({ children }: { children: React.ReactNode }) {
  const [state] = useState(createApplicationState);
  return (
    <Provider store={state}>
      <SessionManager>{children}</SessionManager>
    </Provider>
  );
}

export function useAuth(): UseAuthReturn {
  const dispatch = useApplicationDispatch();
  const state = useApplicationSelector((application) => application.authentication);

  const login = useCallback(
    async (email: string, password: string) => {
      const user = await dispatch(signIn({ email, password })).unwrap();
      dispatch(serverApi.util.resetApiState());
      return user;
    },
    [dispatch]
  );
  const logout = useCallback(async () => {
    await dispatch(signOut()).unwrap();
    dispatch(serverApi.util.resetApiState());
  }, [dispatch]);
  const changePassword = useCallback(async (current: string, next: string) => {
    await authClient.changePassword(current, next);
    dispatch(clearSession());
    dispatch(serverApi.util.resetApiState());
  }, [dispatch]);
  const refetch = useCallback(async () => {
    await dispatch(loadSession()).unwrap();
  }, [dispatch]);

  return {
    user: state.user,
    status: state.status,
    isAuthenticated: state.status === "authenticated",
    loaded: state.status !== "idle" && state.status !== "checking",
    isPending: state.status === "idle" || state.status === "checking",
    isOffline: state.status === "offline",
    error: state.error,
    login,
    logout,
    changePassword,
    refetch,
  };
}
