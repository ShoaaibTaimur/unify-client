"use client";

import { useEffect } from "react";
import { dataApi, REALTIME_CLIENT_ID } from "./api-slice";
import { useAppDispatch } from "./hooks";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export function RealtimeSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!API_URL || typeof EventSource === "undefined") return;

    const source = new EventSource(
      `${API_URL}/api/events?clientId=${encodeURIComponent(REALTIME_CLIENT_ID)}`,
      { withCredentials: true }
    );
    let connected = false;
    source.onopen = () => {
      if (connected) {
        dispatch(
          dataApi.util.invalidateTags(["Activity", "Organization", "User", "Dashboard"])
        );
      }
      connected = true;
    };
    source.addEventListener("changed", (message) => {
      try {
        const { resource } = JSON.parse((message as MessageEvent<string>).data);
        if (resource === "activity") {
          dispatch(dataApi.util.invalidateTags(["Activity", "Dashboard"]));
        } else if (resource === "organization") {
          dispatch(dataApi.util.invalidateTags(["Organization", "Dashboard", "User"]));
        } else if (resource === "user") {
          dispatch(dataApi.util.invalidateTags(["User", "Dashboard"]));
        }
      } catch {
        // Malformed notification contains no application data; ignore it.
      }
    });

    return () => source.close();
  }, [dispatch]);

  return null;
}
