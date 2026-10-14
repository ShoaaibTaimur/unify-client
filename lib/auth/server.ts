import { serverApi } from "../server-api";
import type { User } from "@/types";

export async function getServerUser(): Promise<User | null> {
  try {
    return await serverApi.getCurrentUser();
  } catch {
    return null;
  }
}
