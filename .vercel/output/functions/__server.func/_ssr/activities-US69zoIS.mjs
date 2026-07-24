import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { n as getClassSelection } from "./session-Dp3oTrTK.mjs";
import { t as api } from "./api-BT53Ph7o.mjs";
import { n as ACTIVITY_TYPES } from "./types-CfYcemL6.mjs";
import { s as Search } from "../_libs/lucide-react.mjs";
import { t as ActivityCard } from "./ActivityCard-BJzTutBw.mjs";
import { t as Input } from "./input-DicJzR9-.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activities-US69zoIS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function endDateOf(a) {
	return new Date(a.endDate ?? a.date);
}
function ActivitiesPage() {
	const cls = getClassSelection();
	const [q, setQ] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)("upcoming");
	const activities = useQuery({
		queryKey: ["activities", cls],
		queryFn: () => api.listActivities(cls ?? void 0)
	});
	const filtered = (0, import_react.useMemo)(() => {
		const now = /* @__PURE__ */ new Date();
		const needle = q.trim().toLowerCase();
		return (activities.data ?? []).filter((a) => type === "all" || a.activityType === type).filter((a) => {
			if (status === "all") return true;
			const done = endDateOf(a) < now;
			return status === "completed" ? done : !done;
		}).filter((a) => {
			if (!needle) return true;
			return [
				a.title,
				a.subject,
				a.description,
				a.room,
				a.activityType
			].filter(Boolean).some((f) => f.toLowerCase().includes(needle));
		}).sort((a, b) => new Date(a.startDate ?? a.date).getTime() - new Date(b.startDate ?? b.date).getTime());
	}, [
		activities.data,
		q,
		type,
		status
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "All activities"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Everything scheduled for your class."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-3 rounded-3xl border border-border bg-card p-3 shadow-card md:flex-row md:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search title, subject, room, description…",
						className: "h-11 rounded-2xl border-0 bg-muted/40 pl-11 text-base focus-visible:ring-primary"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
							label: "Upcoming",
							active: status === "upcoming",
							onClick: () => setStatus("upcoming")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
							label: "Completed",
							active: status === "completed",
							onClick: () => setStatus("completed")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
							label: "All",
							active: status === "all",
							onClick: () => setStatus("all")
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypePill, {
					label: "All types",
					active: type === "all",
					onClick: () => setType("all")
				}), ACTIVITY_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypePill, {
					label: t.label,
					active: type === t.value,
					onClick: () => setType(t.value)
				}, t.value))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-4 md:grid-cols-2",
				children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-full rounded-3xl border border-dashed border-border p-14 text-center text-muted-foreground",
					children: "No activities match your filters."
				}) : filtered.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityCard, { activity: a }, a.id))
			})
		]
	});
}
function FilterPill({ label, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		onClick,
		variant: active ? "default" : "ghost",
		className: `h-11 rounded-2xl px-4 ${active ? "" : "text-foreground/70"}`,
		children: label
	});
}
function TypePill({ label, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick,
		className: `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:border-primary/40 hover:text-foreground"}`,
		children: label
	});
}
//#endregion
export { ActivitiesPage as component };
