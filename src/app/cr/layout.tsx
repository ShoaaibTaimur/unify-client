import { PanelClientLayout } from "@/components/PanelClientLayout";

export default function CRLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelClientLayout role="cr" roleLabel="CR" panelHref="/cr">
      {children}
    </PanelClientLayout>
  );
}
