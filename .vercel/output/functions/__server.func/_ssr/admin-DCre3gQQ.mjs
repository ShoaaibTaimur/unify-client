import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { r as getStoredUser, t as clearStoredSession } from "./session-Dp3oTrTK.mjs";
import { f as Menu, m as LogOut } from "../_libs/lucide-react.mjs";
import { t as Logo } from "./Logo-Cejf3dcr.mjs";
import { a as SheetTrigger, i as SheetTitle, n as SheetContent, r as SheetHeader, t as Sheet } from "./sheet-_KMyE__v.mjs";
import { t as ThemeToggle } from "./ThemeToggle-Q65sYqO-.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as ADMIN_NAV } from "./admin-D6iZVRwd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DCre3gQQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLayout() {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [user, setUser] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
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
		if (u.role !== "admin") {
			navigate({ to: u.role === "teacher" ? "/teacher" : "/cr" });
			return;
		}
		setUser(u);
	}, [navigate]);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [pathname]);
	if (!user) return null;
	const NavList = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex-1 space-y-1",
		children: ADMIN_NAV.map((n) => {
			const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
			const Icon = n.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: n.to,
				className: `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
					" ",
					n.label
				]
			}, n.to);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "rounded-full",
							"aria-label": "Open admin menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
						side: "left",
						className: "w-[280px] bg-sidebar p-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, {
							className: "border-b border-border p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
								className: "text-left",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex h-[calc(100%-4rem)] flex-col p-3",
							children: [NavList, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-xl border border-border bg-card p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-medium",
									children: user.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate text-xs text-muted-foreground",
									children: user.email
								})]
							})]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "flex min-w-0 items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden text-right text-xs sm:block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: user.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate text-muted-foreground",
							children: user.email
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "rounded-full",
						onClick: () => {
							clearStoredSession();
							navigate({ to: "/login" });
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-1.5 h-3.5 w-3.5" }), " Sign out"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 p-4 sm:p-6 lg:p-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})]
	});
}
//#endregion
export { AdminLayout as component };
