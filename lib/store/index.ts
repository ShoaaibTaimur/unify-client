import { configureStore } from "@reduxjs/toolkit";
import { authReducer, sessionReceived } from "./auth-slice";
import type { User } from "@/types";

export function makeStore(initialUser?: User | null) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
  });

  if (initialUser) store.dispatch(sessionReceived(initialUser));
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
