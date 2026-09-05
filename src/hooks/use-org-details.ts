import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface OrgFilter {
  departmentId?: string;
  batchId?: string;
  sectionId?: string;
}

export function useOrgDetails(filter?: OrgFilter) {
  const depId = filter?.departmentId;
  const batId = filter?.batchId;
  const secId = filter?.sectionId;

  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.listDepartments(),
    staleTime: 5 * 60_000,
  });

  const batches = useQuery({
    queryKey: ["batches", depId],
    queryFn: () => (depId ? api.listBatches(depId) : []),
    enabled: Boolean(depId),
    staleTime: 5 * 60_000,
  });

  const sections = useQuery({
    queryKey: ["sections", batId],
    queryFn: () => (batId && batId !== "all" ? api.listSections(batId) : []),
    enabled: Boolean(batId && batId !== "all"),
    staleTime: 5 * 60_000,
  });

  const depName = departments.data?.find((d) => d.id === depId)?.name ?? "";
  const batchName =
    batId === "all"
      ? "All Batches"
      : (batches.data?.find((b) => b.id === batId)?.name ?? "");
  const sectionName =
    secId === "all"
      ? "All Sections"
      : (sections.data?.find((s) => s.id === secId)?.name ?? "");

  const parts = [depName, batchName, sectionName].filter(Boolean);
  const formatted = parts.join(" · ");

  return {
    depName,
    batchName,
    sectionName,
    formatted,
    departments: departments.data ?? [],
    batches: batches.data ?? [],
    sections: sections.data ?? [],
    isLoading:
      departments.isLoading ||
      (Boolean(depId) && batches.isLoading) ||
      (Boolean(batId && batId !== "all") && sections.isLoading),
  };
}
