import { PanelClientLayout } from "@/components/layout/PanelClientLayout";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelClientLayout role="teacher" roleLabel="Teacher" panelHref="/teacher">
      {children}
    </PanelClientLayout>
  );
}
