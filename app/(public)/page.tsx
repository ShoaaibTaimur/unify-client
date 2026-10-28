import type { Metadata } from "next";
import { HomeContent } from "@/features/home/components/HomeContent";

export const metadata: Metadata = {
  title: "Dashboard — UNIFY Academic Portal",
  description: "Track today's, upcoming, and past academic activities for your university class.",
};

export default function HomePage() {
  return <HomeContent />;
}
