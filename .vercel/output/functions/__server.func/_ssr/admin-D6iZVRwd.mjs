import { M as CalendarDays, a as Settings, n as Users, u as Network, v as LayoutDashboard } from "../_libs/lucide-react.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-D6iZVRwd.js
var $$splitComponentImporter = () => import("./admin-DCre3gQQ.mjs");
var Route = createFileRoute("/admin")({
	head: () => ({ meta: [
		{ title: "Admin — UNIFY" },
		{
			name: "description",
			content: "Admin console for departments, batches, sections, users, and activities."
		},
		{
			property: "og:title",
			content: "Admin — UNIFY"
		},
		{
			property: "og:description",
			content: "Admin console for UNIFY."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var ADMIN_NAV = [
	{
		to: "/admin",
		label: "Dashboard",
		icon: LayoutDashboard,
		exact: true,
		description: "Overview & quick stats"
	},
	{
		to: "/admin/organization",
		label: "Organization",
		icon: Network,
		description: "Departments, batches & sections"
	},
	{
		to: "/admin/activities",
		label: "Activities",
		icon: CalendarDays,
		description: "All activities across UNIFY"
	},
	{
		to: "/admin/users",
		label: "Users",
		icon: Users,
		description: "CRs, teachers & admins"
	},
	{
		to: "/admin/settings",
		label: "Settings",
		icon: Settings,
		description: "Preferences & configuration"
	}
];
//#endregion
export { Route as n, ADMIN_NAV as t };
