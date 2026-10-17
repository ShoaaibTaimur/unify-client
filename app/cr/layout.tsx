import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function CRLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout role="cr">
      {children}
    </DashboardLayout>
  );
}
