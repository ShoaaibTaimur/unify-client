import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { r as getStoredUser, t as clearStoredSession } from "./session-Dp3oTrTK.mjs";
import { t as api } from "./api-BT53Ph7o.mjs";
import { E as CircleCheck, M as CalendarDays, P as ArrowRight, _ as ListChecks, b as KeyRound, c as Plus, f as Menu, m as LogOut, s as Search, v as LayoutDashboard } from "../_libs/lucide-react.mjs";
import { l as isSameDay } from "../_libs/date-fns.mjs";
import { i as useQueryClient, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as Logo } from "./Logo-Cejf3dcr.mjs";
import { a as SheetTrigger, i as SheetTitle, n as SheetContent, r as SheetHeader, t as Sheet } from "./sheet-_KMyE__v.mjs";
import { t as ThemeToggle } from "./ThemeToggle-Q65sYqO-.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as ManageActivitiesTable, r as useActivityList, t as ActivityFormDialog } from "./ActivityForm-D5UrMHAy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cr-DxO6nGFK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useAuthGuard(role) {
	const navigate = useNavigate();
	const [u, setU] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const user = getStoredUser();
		if (!user) {
			navigate({ to: "/login" });
			return;
		}
		if (user.mustChangePassword) {
			navigate({ to: "/change-password" });
			return;
		}
		if (user.role !== role) {
			navigate({ to: user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/cr" });
			return;
		}
		setU(user);
	}, [navigate, role]);
	return u;
}
function CRDashboard() {
	const user = useAuthGuard("cr");
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const activities = useActivityList(user ? {
		departmentId: user.departmentId,
		batchId: user.batchId,
		sectionId: user.sectionId
	} : void 0);
	const now = /* @__PURE__ */ new Date();
	const list = activities.data ?? [];
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
				title: "CR Dashboard"
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
							children: "Manage activities"
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
				fixed: {
					departmentId: user.departmentId,
					batchId: user.batchId,
					sectionId: user.sectionId
				},
				createdBy: user.id
			})
		]
	});
}
var PANEL_NAV = [
	{
		to: "/",
		label: "Public dashboard",
		icon: LayoutDashboard,
		description: "Student-facing home"
	},
	{
		to: "/activities",
		label: "Browse activities",
		icon: Search,
		description: "Search & filter"
	},
	{
		to: "/calendar",
		label: "Calendar",
		icon: CalendarDays,
		description: "Monthly view"
	},
	{
		to: "/change-password",
		label: "Change password",
		icon: KeyRound,
		description: "Update credentials"
	}
];
function QuickActions({ onAdd }) {
	const items = [...onAdd ? [{
		label: "Add activity",
		description: "Create a new activity",
		icon: Plus,
		onClick: onAdd
	}] : [], ...PANEL_NAV.map((n) => ({
		label: n.label,
		description: n.description,
		icon: n.icon,
		to: n.to
	}))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Quick actions"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Everything you need, in one place."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: items.map((n) => {
					const Icon = n.icon;
					const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: n.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate text-xs text-muted-foreground",
								children: n.description
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" })
					] });
					const cls = "group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md";
					return "to" in n && n.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: n.to,
						className: cls,
						children: inner
					}, n.label) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: n.onClick,
						className: cls,
						children: inner
					}, n.label);
				})
			})
		]
	});
}
function TopBar({ user, title }) {
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								"aria-label": "Open menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
							side: "left",
							className: "w-[280px] p-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, {
								className: "border-b border-border p-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
									className: "text-left",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
								className: "flex flex-col p-3",
								children: [
									PANEL_NAV.map((n) => {
										const Icon = n.icon;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: n.to,
											onClick: () => setOpen(false),
											className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
												" ",
												n.label
											]
										}, n.to);
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-3 border-t border-border" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border bg-card p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs font-medium",
											children: user.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate text-xs text-muted-foreground",
											children: user.email
										})]
									})
								]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "flex min-w-0 items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden font-display text-lg md:block",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
				})
			]
		})
	});
}
function Stat({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl border border-border bg-card p-5 shadow-card",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&>svg]:h-5 [&>svg]:w-5",
				children: icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-3xl leading-tight",
					children: value
				})]
			})]
		})
	});
}
//#endregion
export { QuickActions, Stat, TopBar, CRDashboard as component };
