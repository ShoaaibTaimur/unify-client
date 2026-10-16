import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authClient, AuthClientError } from "@/lib/auth/client";
import type { AuthStatus, LoginCredentials, User } from "@/types";

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  lastVerifiedAt: number | null;
}

export interface AuthFailure {
  message: string;
  kind: "network" | "server" | "validation";
  status?: number;
  code?: string;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  lastVerifiedAt: null,
};

function toFailure(error: unknown): AuthFailure {
  if (error instanceof AuthClientError) {
    return {
      message: error.message,
      kind: error.kind,
      status: error.status,
      code: error.code,
    };
  }

  return {
    message: error instanceof Error ? error.message : "Authentication failed",
    kind: "server",
  };
}

export const initializeSession = createAsyncThunk<
  User | null,
  void,
  { rejectValue: AuthFailure }
>("auth/initializeSession", async (_, { rejectWithValue }) => {
  try {
    const session = await authClient.getSession();
    return session.user;
  } catch (error) {
    return rejectWithValue(toFailure(error));
  }
});

export const loginSession = createAsyncThunk<
  User,
  LoginCredentials,
  { rejectValue: AuthFailure }
>("auth/loginSession", async (credentials, { rejectWithValue }) => {
  try {
    const result = await authClient.signIn(credentials);
    return result.user;
  } catch (error) {
    return rejectWithValue(toFailure(error));
  }
});

export const logoutSession = createAsyncThunk<
  void,
  void,
  { rejectValue: AuthFailure }
>("auth/logoutSession", async (_, { rejectWithValue }) => {
  try {
    await authClient.signOut();
  } catch (error) {
    return rejectWithValue(toFailure(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionReceived(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = "authenticated";
      state.error = null;
      state.lastVerifiedAt = Date.now();
    },
    sessionEnded(state) {
      state.user = null;
      state.status = "anonymous";
      state.error = null;
      state.lastVerifiedAt = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeSession.pending, (state) => {
        if (!state.user) state.status = "checking";
        state.error = null;
      })
      .addCase(initializeSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? "authenticated" : "anonymous";
        state.error = null;
        state.lastVerifiedAt = Date.now();
      })
      .addCase(initializeSession.rejected, (state, action) => {
        const failure = action.payload;
        state.error = failure?.message ?? "Unable to verify session";
        // Only a completed session check may declare the user anonymous.
        // Network and server failures must not erase a potentially valid session.
        state.status = state.user ? "authenticated" : "offline";
      })
      .addCase(loginSession.pending, (state) => {
        state.error = null;
      })
      .addCase(loginSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
        state.error = null;
        state.lastVerifiedAt = Date.now();
      })
      .addCase(loginSession.rejected, (state, action) => {
        state.error = action.payload?.message ?? "Login failed";
        if (!state.user) {
          state.status = action.payload?.kind === "validation" ? "anonymous" : "offline";
        }
      })
      .addCase(logoutSession.pending, (state) => {
        state.error = null;
      })
      .addCase(logoutSession.fulfilled, (state) => {
        state.user = null;
        state.status = "anonymous";
        state.error = null;
        state.lastVerifiedAt = Date.now();
      })
      .addCase(logoutSession.rejected, (state, action) => {
        state.error = action.payload?.message ?? "Logout failed";
      });
  },
});

export const { sessionReceived, sessionEnded } = authSlice.actions;
export const authReducer = authSlice.reducer;
