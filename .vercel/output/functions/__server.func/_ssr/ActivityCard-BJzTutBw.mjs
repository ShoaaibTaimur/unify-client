import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as ACTIVITY_TYPES, t as ACTIVITY_COLOR } from "./types-CfYcemL6.mjs";
import { C as Clock, p as MapPin } from "../_libs/lucide-react.mjs";
import { r as format } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ActivityCard-BJzTutBw.js
var import_jsx_runtime = require_jsx_runtime();
function activityLabel(t) {
	return ACTIVITY_TYPES.find((x) => x.value === t)?.label ?? t;
}
function ActivityCard({ activity, compact = false }) {
	const isRange = !!activity.startDate;
	const color = ACTIVITY_COLOR[activity.activityType];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "absolute inset-y-0 left-0 w-1",
			style: { background: color }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-start justify-between gap-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white",
							style: { background: color },
							children: activityLabel(activity.activityType)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-xs text-muted-foreground",
							children: activity.subject
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-2 truncate font-display text-lg font-semibold text-foreground",
						children: activity.title
					}),
					!compact && activity.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
						children: activity.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }), isRange ? `${format(new Date(activity.startDate), "MMM d")} – ${format(new Date(activity.endDate), "MMM d, yyyy")}` : format(new Date(activity.date), "EEE, MMM d • h:mm a")]
						}), activity.room && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }), activity.room]
						})]
					})
				]
			})
		})]
	});
}
//#endregion
export { activityLabel as n, ActivityCard as t };
