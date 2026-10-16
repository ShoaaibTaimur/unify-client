"use client";

import { useRef } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { AuthProvider } from "@/lib/auth";
import { makeStore, type AppStore } from "@/lib/store";
import { RealtimeSync } from "@/lib/store/RealtimeSync";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  return (
    <ReduxProvider store={storeRef.current}>
      <AuthProvider>
        <RealtimeSync />
        {children}
      </AuthProvider>
    </ReduxProvider>
  );
}
