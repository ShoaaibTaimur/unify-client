import { getAccessToken } from "./cookies";
import { serverApi } from "../server-api";
import type { User } from "@/types";

export async function getServerToken(): Promise<string | null> {
  return getAccessToken();
}
export async function getServerUser(): Promise<User | null> {
  try {
    return await serverApi.getCurrentUser();
  } catch {
    return null;
  }
}
