import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { n as getClassSelection } from "./session-Dp3oTrTK.mjs";
import { t as api } from "./api-BT53Ph7o.mjs";
import { t as ACTIVITY_COLOR } from "./types-CfYcemL6.mjs";
import { O as ChevronRight, k as ChevronLeft } from "../_libs/lucide-react.mjs";
import { a as startOfMonth, c as endOfMonth, d as addMonths, i as endOfWeek, l as isSameDay, n as isSameMonth, o as eachDayOfInterval, r as format, t as subMonths, u as startOfWeek } from "../_libs/date-fns.mjs";
import { n as activityLabel } from "./ActivityCard-BJzTutBw.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-MUxAZiye.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function dayActivities(day, list) {
	return list.filter((a) => {
		if (a.startDate && a.endDate) {
			const s = new Date(a.startDate);
			const e = new Date(a.endDate);
			return day >= new Date(s.getFullYear(), s.getMonth(), s.getDate()) && day <= new Date(e.getFullYear(), e.getMonth(), e.getDate());
		}
		return a.date ? isSameDay(new Date(a.date), day) : false;
	});
}
function CalendarPage() {
	const cls = getClassSelection();
	const [cursor, setCursor] = (0, import_react.useState)(/* @__PURE__ */ new Date());
	const activities = useQuery({
		queryKey: ["activities", cls],
		queryFn: () => api.listActivities(cls ?? void 0)
	});
	const start = startOfWeek(startOfMonth(cursor));
	const end = endOfWeek(endOfMonth(cursor));
	const days = (0, import_react.useMemo)(() => eachDayOfInterval({
		start,
		end
	}), [start, end]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl sm:text-4xl",
						children: "Calendar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Month view of every activity."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							className: "shrink-0 rounded-full",
							onClick: () => setCursor(subMonths(cursor, 1)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 truncate text-center font-display text-base sm:min-w-[10rem] sm:flex-none sm:text-lg",
							children: format(cursor, "MMMM yyyy")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							className: "shrink-0 rounded-full",
							onClick: () => setCursor(addMonths(cursor, 1)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "shrink-0 rounded-full",
							onClick: () => setCursor(/* @__PURE__ */ new Date()),
							children: "Today"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-7 border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground",
					children: [
						"Sun",
						"Mon",
						"Tue",
						"Wed",
						"Thu",
						"Fri",
						"Sat"
					].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-3 py-2 text-center",
						children: d
					}, d))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-7",
					children: days.map((day) => {
						const inMonth = isSameMonth(day, cursor);
						const today = isSameDay(day, /* @__PURE__ */ new Date());
						const items = dayActivities(day, activities.data ?? []);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `min-h-28 border-b border-r border-border p-2 last:border-r-0 ${inMonth ? "bg-card" : "bg-muted/20 text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-between",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${today ? "bg-primary text-primary-foreground" : ""}`,
									children: format(day, "d")
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 space-y-1",
								children: [items.slice(0, 3).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate rounded-md px-2 py-0.5 text-[11px] font-medium text-white",
									style: { background: ACTIVITY_COLOR[a.activityType] },
									title: `${activityLabel(a.activityType)} — ${a.title}`,
									children: a.title
								}, a.id)), items.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pl-1 text-[11px] text-muted-foreground",
									children: [
										"+",
										items.length - 3,
										" more"
									]
								})]
							})]
						}, day.toISOString());
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground",
				children: Object.entries(ACTIVITY_COLOR).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "h-2.5 w-2.5 rounded-full",
						style: { background: v }
					}), activityLabel(k)]
				}, k))
			})
		]
	});
}
//#endregion
export { CalendarPage as component };
