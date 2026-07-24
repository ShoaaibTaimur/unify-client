import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { t as api } from "./api-BT53Ph7o.mjs";
import { c as Plus } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as ManageActivitiesTable, t as ActivityFormDialog } from "./ActivityForm-D5UrMHAy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.activities-BuyCMLD6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminActivitiesPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const activities = useQuery({
		queryKey: ["activities", "all"],
		queryFn: () => api.listActivities()
	});
	const del = useMutation({
		mutationFn: (a) => api.deleteActivity(a.id),
		onSuccess: () => {
			toast.success("Deleted");
			qc.invalidateQueries({ queryKey: ["activities"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "All activities"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Every activity across every department."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "rounded-full",
				onClick: () => {
					setEditing(null);
					setOpen(true);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Add"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManageActivitiesTable, {
				activities: activities.data ?? [],
				onEdit: (a) => {
					setEditing(a);
					setOpen(true);
				},
				onDelete: (a) => del.mutate(a)
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityFormDialog, {
			open,
			onOpenChange: setOpen,
			editing,
			chooseDepartment: true,
			createdBy: "u-admin"
		})
	] });
}
//#endregion
export { AdminActivitiesPage as component };
