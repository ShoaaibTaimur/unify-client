import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Role, User } from "@/lib/types";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const users = useQuery({ queryKey: ["users"], queryFn: () => api.listUsers() });

  return (
    <div>
      <h1 className="font-display text-4xl">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage CRs, Teachers, and Admins.</p>

      <Tabs defaultValue="cr" className="mt-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="cr" className="rounded-full">CR</TabsTrigger>
          <TabsTrigger value="teacher" className="rounded-full">Teachers</TabsTrigger>
          <TabsTrigger value="admin" className="rounded-full">Admins</TabsTrigger>
        </TabsList>
        {(["cr", "teacher", "admin"] as Role[]).map(r => (
          <TabsContent key={r} value={r} className="mt-4">
            <UserTable users={(users.data ?? []).filter(u => u.role === r)} role={r} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function UserTable({ users, role }: { users: User[]; role: Role }) {
  const [creating, setCreating] = useState(false);
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button className="rounded-full" onClick={() => setCreating(true)}>+ Create {role}</Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Assignment</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No {role}s yet.</td></tr>}
            {users.map(u => (
              <tr key={u.id} className="border-b border-border/60 last:border-b-0">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {[u.departmentId, u.batchId, u.sectionId].filter(Boolean).join(" · ") || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.info("Edit coming soon — wire to your backend")}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.info("Reset password coming soon — wire to your backend")}>Reset password</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast.info("Delete coming soon — wire to your backend")}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      {creating && (
        <p className="mt-3 text-xs text-muted-foreground">
          Wire this form to your <code>/api/users</code> endpoint in <code>server/</code>. The account should be created with <code>mustChangePassword: true</code>.
        </p>
      )}
    </div>
  );
}
