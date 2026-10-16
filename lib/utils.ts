export { cn } from "cn";
import type { ClassSelection } from "@/types";

export function hasSelectedClass(sel: ClassSelection | null): boolean {
  return Boolean(sel && sel.departmentId && sel.batchId);
}
