import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { r as getStoredUser } from "./session-Dp3oTrTK.mjs";
import { t as api } from "./api-BT53Ph7o.mjs";
import { E as CircleCheck, M as CalendarDays, _ as ListChecks, c as Plus } from "../_libs/lucide-react.mjs";
import { l as isSameDay } from "../_libs/date-fns.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as ManageActivitiesTable, r as useActivityList, t as ActivityFormDialog } from "./ActivityForm-D5UrMHAy.mjs";
import { i as TopBar, r as Stat, t as QuickActions } from "./cr-DBQyK8a5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/teacher-BDvCXYfJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TeacherDashboard() {
	const navigate = useNavigate();
	const [user, setUser] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const u = getStoredUser();
		if (!u) {
			navigate({ to: "/login" });
			return;
		}
		if (u.mustChangePassword) {
			navigate({ to: "/change-password" });
			return;
		}
		if (u.role !== "teacher") {
			navigate({ to: u.role === "admin" ? "/admin" : "/cr" });
			return;
		}
		setUser(u);
	}, [navigate]);
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const list = useActivityList(user ? { departmentId: user.departmentId } : void 0).data ?? [];
	const now = /* @__PURE__ */ new Date();
	const todays = list.filter((a) => a.date && isSameDay(new Date(a.date), now));
	const upcoming = list.filter((a) => new Date(a.startDate ?? a.date) >= now);
	const completed = list.filter((a) => new Date(a.endDate ?? a.date) < now);
	const del = useMutation({
		mutationFn: (a) => api.deleteActivity(a.id),
		onSuccess: () => {
			toast.success("Activity deleted");
			qc.invalidateQueries({ queryKey: ["activities"] });
		}
	});
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				user,
				title: "Teacher Dashboard"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {}),
								label: "Today",
								value: todays.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, {}),
								label: "Upcoming",
								value: upcoming.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {}),
								label: "Completed",
								value: completed.length
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickActions, { onAdd: () => {
						setEditing(null);
						setOpen(true);
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "All activities in your department"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "rounded-full",
							onClick: () => {
								setEditing(null);
								setOpen(true);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Add activity"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManageActivitiesTable, {
							activities: list,
							onEdit: (a) => {
								setEditing(a);
								setOpen(true);
							},
							onDelete: (a) => del.mutate(a)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityFormDialog, {
				open,
				onOpenChange: setOpen,
				editing,
				fixed: { departmentId: user.departmentId },
				chooseBatchSection: true,
				createdBy: user.id
			})
		]
	});
}
//#endregion
export { TeacherDashboard as component };
