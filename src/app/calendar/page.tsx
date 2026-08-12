import type { Metadata } from "next";
import { CalendarView } from "@/components/views/CalendarView";

export const metadata: Metadata = {
  title: "Activity Calendar — UNIFY",
  description: "Month view of every class test, lab test, viva, assignment, and exam scheduled for your class.",
};

export default function CalendarPage() {
  return <CalendarView />;
}
