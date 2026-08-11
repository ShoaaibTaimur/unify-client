import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Activity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Check if there are active or upcoming mid-term or final exams in the given activities list */
export function hasActiveExams(activities: Activity[] | undefined | null): boolean {
  if (!activities || activities.length === 0) return false;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return activities.some((a) => {
    const isExamType = a.activityType === "mid-exam" || a.activityType === "final-exam";
    if (!isExamType) return false;

    if (a.endDate) {
      const eD = new Date(a.endDate);
      return !isNaN(eD.getTime()) && eD >= todayStart;
    }
    if (a.startDate) {
      const sD = new Date(a.startDate);
      return !isNaN(sD.getTime()) && sD >= todayStart;
    }
    if (a.date) {
      const d = new Date(a.date);
      return !isNaN(d.getTime()) && d >= todayStart;
    }

    return true;
  });
}
