import { getAccessToken } from "./cookies";
import { serverApi } from "../server-api";
import type { User } from "@/types";

export async function getServerToken(): Promise<string | null> {
  return getAccessToken();
}

/**
 * Authoritatively retrieves current authenticated user from backend using server-side access token.
 * Prevents client-side cookie forgery vulnerabilities.
 */
export async function getServerUser(): Promise<User | null> {
  try {
    return await serverApi.getCurrentUser();
  } catch {
    return null;
  }
}
