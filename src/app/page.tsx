import type { Metadata } from "next";
import { HomeView } from "@/components/views/HomeView";

export const metadata: Metadata = {
  title: "Dashboard — UNIFY Academic Portal",
  description: "Track today's, upcoming, and past academic activities for your university class.",
};

export default function HomePage() {
  return <HomeView />;
}
