import { cookies } from "next/headers";
import type { ClassSelection } from "./types";

const CLASS_KEY = "unify_class";

export async function getServerClassSelection(): Promise<ClassSelection | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(CLASS_KEY)?.value;
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(raw)) as ClassSelection;
  } catch {
    return null;
  }
}
