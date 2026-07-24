import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as api } from "./api-BT53Ph7o.mjs";
import { M as CalendarDays, N as Building2, P as ArrowRight, S as GraduationCap, n as Users, y as Layers } from "../_libs/lucide-react.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as ADMIN_NAV } from "./admin-D6iZVRwd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.index-CatWrfZT.js
var import_jsx_runtime = require_jsx_runtime();
function AdminOverview() {
	const departments = useQuery({
		queryKey: ["departments"],
		queryFn: () => api.listDepartments()
	});
	const batches = useQuery({
		queryKey: ["batches", "all"],
		queryFn: () => api.listBatches()
	});
	const sections = useQuery({
		queryKey: ["sections", "all"],
		queryFn: () => api.listSections()
	});
	const users = useQuery({
		queryKey: ["users"],
		queryFn: () => api.listUsers()
	});
	const activities = useQuery({
		queryKey: ["activities", "all"],
		queryFn: () => api.listActivities()
	});
	const cards = [
		{
			label: "Departments",
			value: departments.data?.length ?? 0,
			icon: Building2
		},
		{
			label: "Batches",
			value: batches.data?.length ?? 0,
			icon: Layers
		},
		{
			label: "Sections",
			value: sections.data?.length ?? 0,
			icon: GraduationCap
		},
		{
			label: "Users",
			value: users.data?.length ?? 0,
			icon: Users
		},
		{
			label: "Activities",
			value: activities.data?.length ?? 0,
			icon: CalendarDays
		}
	];
	const quickNav = ADMIN_NAV.filter((n) => !n.exact);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl sm:text-4xl",
			children: "Admin dashboard"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "A quick look at UNIFY across the university."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5",
			children: cards.map((c) => {
				const Icon = c.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-border bg-card p-5 shadow-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs uppercase tracking-wide text-muted-foreground",
								children: c.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-3xl leading-tight",
								children: c.value
							})]
						})]
					})
				}, c.label);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-end justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Manage everything"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "All admin sections in one place."
				})] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: quickNav.map((n) => {
					const Icon = n.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: n.to,
						className: "group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: n.label
								}), n.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-xs text-muted-foreground",
									children: n.description
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" })
						]
					}, n.to);
				})
			})]
		})
	] });
}
//#endregion
export { AdminOverview as component };
