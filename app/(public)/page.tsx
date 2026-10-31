import type { Metadata } from "next";
import { HomeContent } from "@/components/features/home/HomeContent";

export const metadata: Metadata = {
  title: "UNIFY Academic Portal",
  description: "Track today's, upcoming, and past academic activities for your university class.",
};

export default function HomePage() {
  return <HomeContent />;
}
