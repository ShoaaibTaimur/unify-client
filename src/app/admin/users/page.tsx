"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { PageLoader } from "@/components/PageLoader";
import type { Role, User } from "@/lib/types";

export default function UsersPage() {
  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => api.listUsers(),
  });

  if (users.isLoading) {
    return <PageLoader text="Loading users..." />;
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage CRs, Teachers, and Admins across the university.
      </p>

      <Tabs defaultValue="cr" className="mt-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="cr" className="rounded-full">
            CRs
          </TabsTrigger>
          <TabsTrigger value="teacher" className="rounded-full">
            Teachers
          </TabsTrigger>
          <TabsTrigger value="admin" className="rounded-full">
            Admins
          </TabsTrigger>
        </TabsList>
        {(["cr", "teacher", "admin"] as Role[]).map((r) => (
          <TabsContent key={r} value={r} className="mt-4">
            <UserTable
              users={(users.data ?? []).filter((u) => u.role === r)}
              role={r}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function UserTable({ users, role }: { users: User[]; role: Role }) {
  const [creating, setCreating] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const qc = useQueryClient();

  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = (validPage - 1) * pageSize;
  const paginatedUsers = users.slice(startIdx, startIdx + pageSize);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold capitalize">
            {role}s
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage {role} accounts and permissions across departments.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create{" "}
          {role === "cr" ? "CR" : role}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">
                  Assigned Class / Dept
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No {role}s yet. Click &quot;+ Create {role.toUpperCase()}&quot; to
                    add one.
                  </td>
                </tr>
              )}
              {paginatedUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/60 last:border-b-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {[u.departmentId, u.batchId, u.sectionId]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={deleteMutation.isPending}
                      onClick={() => setDeletingUser(u)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Pagination Bar */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3 text-xs">
            <div className="text-muted-foreground">
              Showing <strong className="text-foreground font-semibold">{startIdx + 1}</strong> to{" "}
              <strong className="text-foreground font-semibold">{Math.min(startIdx + pageSize, totalItems)}</strong> of{" "}
              <strong className="text-foreground font-semibold">{totalItems}</strong> entries
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Rows per page:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => {
                    setPageSize(Number(val));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-16 rounded-xl bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  Page {validPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-xl"
                    disabled={validPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-xl"
                    disabled={validPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateUserDialog
        open={creating}
        onOpenChange={setCreating}
        defaultRole={role}
      />

      <ConfirmDeleteDialog
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
        itemName={
          deletingUser
            ? `user account "${deletingUser.email}"`
            : "this user account"
        }
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingUser) {
            deleteMutation.mutate(deletingUser.id);
            setDeletingUser(null);
          }
        }}
      />
    </div>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
  defaultRole,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole: Role;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(defaultRole);
  const [departmentId, setDepartmentId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [sectionId, setSectionId] = useState("");

  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.listDepartments(),
  });
  const batches = useQuery({
    queryKey: ["batches", departmentId],
    enabled: !!departmentId,
    queryFn: () => api.listBatches(departmentId),
  });
  const sections = useQuery({
    queryKey: ["sections", batchId],
    enabled: !!batchId,
    queryFn: () => api.listSections(batchId),
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.createUser({
        name,
        email,
        password,
        role,
        departmentId: departmentId || undefined,
        batchId: batchId || undefined,
        sectionId: sectionId || undefined,
      }),
    onSuccess: () => {
      toast.success(`User ${email} created successfully`);
      qc.invalidateQueries({ queryKey: ["users"] });
      setName("");
      setEmail("");
      setPassword("");
      onOpenChange(false);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const canSubmit = name && email && password.length >= 6;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Create new account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Role
            </label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as Role)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cr">Class Representative (CR)</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@unify.edu"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Initial Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="rounded-xl"
            />
          </div>

          {role !== "admin" && (
            <div className="space-y-3 border-t border-border pt-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Department
                </label>
                <Select
                  value={departmentId}
                  onValueChange={(v) => {
                    setDepartmentId(v);
                    setBatchId("");
                    setSectionId("");
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.data?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {role === "cr" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Batch
                    </label>
                    <Select
                      value={batchId}
                      onValueChange={(v) => {
                        setBatchId(v);
                        setSectionId("");
                      }}
                      disabled={!departmentId}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select Batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.data?.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Section
                    </label>
                    <Select
                      value={sectionId}
                      onValueChange={setSectionId}
                      disabled={!batchId}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.data?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
