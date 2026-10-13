import { cookies } from "next/headers";
import type { User } from "@/types";

const TOKEN_KEY = "unify_token";
const USER_KEY = "unify_user";

export async function getServerToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_KEY)?.value;
    return token ? decodeURIComponent(token) : null;
  } catch {
    return null;
  }
}

export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(USER_KEY)?.value;
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(raw)) as User;
  } catch {
    return null;
  }
}
