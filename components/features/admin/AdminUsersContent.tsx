"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/features/auth/PasswordInput";
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
import { Plus, ChevronLeft, ChevronRight, KeyRound, Copy, Check, Pencil } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Role, User } from "@/types/auth";
import {
  getServerErrorMessage,
  useAdminUsersQuery,
  useOrganizationQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useUpdateUserMutation,
} from "@/lib/api";

export function AdminUsersContent() {
  const [role, setRole] = useState<Role>("cr");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const users = useAdminUsersQuery({ role, page, pageSize });

  if (users.isError) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load users.</p>
        <p className="mt-1 text-xs text-muted-foreground">{getServerErrorMessage(users.error)}</p>
        <button
          onClick={() => users.refetch()}
          className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-bold">
          USER ACCESS CONTROL
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          User Management
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Manage CRs, Teachers, and Admins across all departments and academic cohorts.
        </p>
      </div>

      <Tabs value={role} onValueChange={(value) => { setRole(value as Role); setPage(1); }} className="mt-4">
        <TabsList className="w-full grid grid-cols-3 rounded-[4px] border border-border bg-secondary/40 p-1 h-auto sm:inline-flex sm:w-auto sm:h-10">
          <TabsTrigger
            value="cr"
            className="rounded-[4px] font-mono text-[11px] sm:text-xs uppercase tracking-wider font-semibold py-1.5 sm:py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-center"
          >
            <span className="sm:hidden">CRs</span>
            <span className="hidden sm:inline">Class Representatives</span>
          </TabsTrigger>
          <TabsTrigger
            value="teacher"
            className="rounded-[4px] font-mono text-[11px] sm:text-xs uppercase tracking-wider font-semibold py-1.5 sm:py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-center"
          >
            <span className="sm:hidden">Teachers</span>
            <span className="hidden sm:inline">Faculty / Teachers</span>
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="rounded-[4px] font-mono text-[11px] sm:text-xs uppercase tracking-wider font-semibold py-1.5 sm:py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-center"
          >
            <span className="sm:hidden">Admins</span>
            <span className="hidden sm:inline">Administrators</span>
          </TabsTrigger>
        </TabsList>
          <TabsContent value={role} className="mt-6">
            {users.isLoading ? (
              <div className="space-y-2">
                {[1,2,3,4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-[4px]" />)}
              </div>
            ) : (
              <UserTable
                users={users.data?.users ?? []}
                role={role}
                pagination={users.data?.pagination}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              />
            )}
          </TabsContent>
      </Tabs>
    </div>
  );
}

function UserTable({ users, role, pagination, onPageChange, onPageSizeChange }: {
  users: User[];
  role: Role;
  pagination?: { page: number; pageSize: number; totalItems: number; totalPages: number };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const currentPage = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 10;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const startIdx = (currentPage - 1) * pageSize;

  const [deleteUser, deleteStatus] = useDeleteUserMutation();
  async function removeUser() {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser.id).unwrap();
      toast.success("User deleted");
      setDeletingUser(null);
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-foreground">
            {role} Accounts
          </h2>
          <p className="font-mono text-[11px] text-muted-foreground">
            Manage {role} accounts and permissions across academic departments.
          </p>
        </div>
        <Button className="rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold h-9 px-4 shadow-2xs transition-colors" onClick={() => setCreating(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Create{" "}
          {role === "cr" ? "CR" : role}
        </Button>
      </div>

      <div className="overflow-hidden rounded-[4px] border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border bg-secondary/40 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-muted-foreground">
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
                    className="px-4 py-10 text-center font-mono text-xs text-muted-foreground"
                  >
                    No {role} accounts yet. Click &quot;+ Create {role.toUpperCase()}&quot; to
                    add one.
                  </td>
                </tr>
              )}
              {users.map((u) => {
                return (
                  <tr
                    key={u.id}
                    className="border-b border-border/60 last:border-b-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground/80">
                      {u.organizationLabel || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 rounded-[4px] border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-[11px] uppercase tracking-wider font-semibold transition-colors"
                          onClick={() => setEditingUser(u)}
                        >
                          <Pencil className="h-3 w-3 text-primary" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 rounded-[4px] border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-[11px] uppercase tracking-wider font-semibold transition-colors"
                          onClick={() => setResettingUser(u)}
                        >
                          <KeyRound className="h-3 w-3 text-primary" />
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 rounded-[4px] font-mono text-[11px] uppercase tracking-wider text-destructive hover:bg-destructive/10 transition-colors"
                          disabled={deleteStatus.isLoading}
                          onClick={() => setDeletingUser(u)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border bg-secondary/20 px-4 py-2.5 font-mono text-xs">
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
                    onPageSizeChange(Number(val));
                  }}
                >
                  <SelectTrigger className="h-7 w-16 rounded-[4px] border border-border bg-card font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-[4px]">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-[4px] border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-[4px] border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
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
        isPending={deleteStatus.isLoading}
        onConfirm={() => void removeUser()}
      />
      <ResetPasswordDialog
        user={resettingUser}
        open={!!resettingUser}
        onOpenChange={(open) => {
          if (!open) setResettingUser(null);
        }}
      />
      <EditUserDialog
        key={editingUser?.id ?? "closed"}
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
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
  const [role, setRole] = useState<Role>(defaultRole);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [sectionId, setSectionId] = useState("");

  const [createUser, createStatus] = useCreateUserMutation();
  async function addUser() {
    try {
      await createUser({
        email,
        name,
        password,
        role,
        departmentId: departmentId || undefined,
        batchId: role === "cr" ? batchId || undefined : undefined,
        sectionId: role === "cr" ? sectionId || undefined : undefined,
      }).unwrap();
      toast.success("User account created successfully");
      onOpenChange(false);
      setEmail("");
      setName("");
      setPassword("");
      setDepartmentId("");
      setBatchId("");
      setSectionId("");
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

  const isFormValid =
    email &&
    name &&
    password &&
    (role === "admin" || departmentId) &&
    (role !== "cr" || (batchId && sectionId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Create User Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cr">Class Representative (CR)</SelectItem>
                <SelectItem value="teacher">Faculty Teacher</SelectItem>
                <SelectItem value="admin">System Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Alex Vance"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@university.edu"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Temporary Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="rounded-xl"
            />
          </div>

          <OrganizationFields
            role={role}
            departmentId={departmentId}
            batchId={batchId}
            sectionId={sectionId}
            setDepartmentId={setDepartmentId}
            setBatchId={setBatchId}
            setSectionId={setSectionId}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!isFormValid || createStatus.isLoading}
            className="rounded-xl"
            onClick={() => void addUser()}
          >
            {createStatus.isLoading ? "Creating..." : "Create Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [customPassword, setCustomPassword] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [result, setResult] = useState<{ temporaryPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [resetPassword, resetStatus] = useResetUserPasswordMutation();

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setResult(null);
      setCustomPassword("");
      setUseCustom(false);
      setCopied(false);
    }, 200);
  };

  async function enforceTemporaryPassword() {
    if (!user) return;
    try {
      const data = await resetPassword({
        id: user.id,
        temporaryPassword: useCustom && customPassword ? customPassword : undefined,
      }).unwrap();
      setResult({ temporaryPassword: data.temporaryPassword });
      toast.success("Temporary password enforced successfully");
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

  const handleCopy = () => {
    if (!result?.temporaryPassword) return;
    navigator.clipboard.writeText(result.temporaryPassword);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-semibold">
                Reset User Password
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Enforce a new temporary login password
              </p>
            </div>
          </div>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-2">
            <div className="rounded-[4px] border border-emerald-500/20 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-700 dark:text-emerald-400">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                Temporary password generated!
              </p>
              <p className="mt-1 leading-relaxed">
                The account has been updated and flagged. On next login, the user will be
                automatically forced to choose a new secure password.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Temporary Password for {user.name} ({user.email})
              </label>
              <div className="flex items-center gap-2">
                <div className="flex h-11 flex-1 items-center justify-between rounded-xl border border-border bg-muted/50 px-3.5 font-mono text-base font-semibold tracking-wider text-foreground select-all">
                  <span>{result.temporaryPassword}</span>
                </div>
                <Button
                  type="button"
                  onClick={handleCopy}
                  className="h-11 rounded-xl px-4 gap-2 text-xs font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button onClick={handleClose} className="w-full rounded-xl">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-2 text-sm">
            <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs">
              <div className="font-medium text-foreground">{user.name}</div>
              <div className="text-muted-foreground">
                {user.email} · {user.role.toUpperCase()}
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Generating a temporary password will immediately overwrite existing credentials.
              The user will be required to change it immediately after signing in.
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  className="rounded border-border accent-primary h-4 w-4"
                />
                Specify custom temporary password (otherwise auto-generated)
              </label>

              {useCustom && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <PasswordInput
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter temp password (min 6 chars)"
                    className="rounded-xl"
                  />
                  {customPassword && customPassword.length < 6 && (
                    <p className="text-[11px] text-destructive">
                      Minimum 6 characters required
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={handleClose}
                disabled={resetStatus.isLoading}
              >
                Cancel
              </Button>
              <Button
                disabled={
                  resetStatus.isLoading ||
                  (useCustom && (!customPassword || customPassword.length < 6))
                }
                className="rounded-xl"
                onClick={() => void enforceTemporaryPassword()}
              >
                {resetStatus.isLoading ? "Generating..." : "Enforce Temp Password"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [departmentId, setDepartmentId] = useState(user?.departmentId ?? "");
  const [batchId, setBatchId] = useState(user?.batchId ?? "");
  const [sectionId, setSectionId] = useState(user?.sectionId ?? "");

  const [updateUser, updateStatus] = useUpdateUserMutation();
  async function saveUser() {
    if (!user) return;
    try {
      await updateUser({ id: user.id, data: {
        name: name.trim(),
        departmentId: user.role === "admin" ? null : departmentId || null,
        batchId: user.role === "cr" ? batchId || null : null,
        sectionId: user.role === "cr" ? sectionId || null : null,
      } }).unwrap();
      toast.success("User assignment updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

  if (!user) return null;

  const isFormValid =
    name.trim() &&
    (user.role === "admin" || departmentId) &&
    (user.role !== "cr" || (batchId && sectionId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-semibold">
                Edit User Assignment
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Update {user.role.toUpperCase()} profile & academic assignments
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email</label>
            <Input
              value={user.email}
              disabled
              className="rounded-xl bg-muted/50 text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Alex Vance"
              className="rounded-xl"
            />
          </div>

          <OrganizationFields
            role={user.role}
            departmentId={departmentId}
            batchId={batchId}
            sectionId={sectionId}
            setDepartmentId={setDepartmentId}
            setBatchId={setBatchId}
            setSectionId={setSectionId}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={updateStatus.isLoading}
          >
            Cancel
          </Button>
          <Button
            disabled={!isFormValid || updateStatus.isLoading}
            className="rounded-xl"
            onClick={() => void saveUser()}
          >
            {updateStatus.isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrganizationFields({
  role,
  departmentId,
  batchId,
  sectionId,
  setDepartmentId,
  setBatchId,
  setSectionId,
}: {
  role: Role;
  departmentId: string;
  batchId: string;
  sectionId: string;
  setDepartmentId: (value: string) => void;
  setBatchId: (value: string) => void;
  setSectionId: (value: string) => void;
}) {
  const { data } = useOrganizationQuery();
  if (role === "admin") return null;

  const departments = data?.departments ?? [];
  const batches = data?.batchesByDepartment?.[departmentId] ?? [];
  const sections = data?.sectionsByBatch?.[batchId] ?? [];

  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          {role === "teacher" ? "Faculty Department" : "Department"}
        </label>
        <Select
          value={departmentId}
          onValueChange={(value) => {
            setDepartmentId(value);
            setBatchId("");
            setSectionId("");
          }}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {role === "cr" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Batch</label>
            <Select
              value={batchId}
              onValueChange={(value) => {
                setBatchId(value);
                setSectionId("");
              }}
              disabled={!departmentId}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Section</label>
            <Select value={sectionId} onValueChange={setSectionId} disabled={!batchId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </>
  );
}
