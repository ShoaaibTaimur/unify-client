import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { r as getStoredUser } from "./session-Dp3oTrTK.mjs";
import { E as CircleCheck, M as CalendarDays, T as CircleUserRound, _ as ListChecks, f as Menu, g as LoaderCircle, h as LogIn, r as TriangleAlert, v as LayoutDashboard, w as CircleX, x as Info } from "../_libs/lucide-react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Logo } from "./Logo-Cejf3dcr.mjs";
import { a as SheetTrigger, i as SheetTitle, n as SheetContent, r as SheetHeader, t as Sheet } from "./sheet-_KMyE__v.mjs";
import { n as useTheme, t as ThemeToggle } from "./ThemeToggle-Q65sYqO-.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$12 } from "./admin-D6iZVRwd.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-C5ptT7lJ.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as Route$13 } from "./cr-DBQyK8a5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-ACDrcRab.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DbifpCaV.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
var NAV = [
	{
		to: "/",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/activities",
		label: "Activities",
		icon: ListChecks
	},
	{
		to: "/calendar",
		label: "Calendar",
		icon: CalendarDays
	}
];
function SiteHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [user, setUser] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const sync = () => setUser(getStoredUser());
		sync();
		window.addEventListener("unify:auth-changed", sync);
		return () => window.removeEventListener("unify:auth-changed", sync);
	}, []);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [pathname]);
	const dashLink = user ? user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : user.role === "cr" ? "/cr" : "/" : "/login";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8",
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
							"aria-label": "Open menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
						side: "left",
						className: "w-[300px] p-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, {
							className: "border-b border-border p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
								className: "text-left",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "flex flex-col p-3",
							children: [
								NAV.map((n) => {
									const active = pathname === n.to;
									const Icon = n.icon;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: n.to,
										className: `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
											" ",
											n.label
										]
									}, n.to);
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-3 border-t border-border" }),
								user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: dashLink,
									className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleUserRound, { className: "h-4 w-4" }),
										user.role[0].toUpperCase() + user.role.slice(1),
										" panel"
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/login",
									className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4" }), " Sign in"]
								})
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "flex min-w-0 items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}), user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: dashLink,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "rounded-full",
						children: [user.role[0].toUpperCase() + user.role.slice(1), " panel"]
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						className: "rounded-full",
						children: "Sign in"
					})
				})]
			})]
		})
	});
}
var CREDITS = [{
	name: "Md Shoaaib Taimur",
	role: "Creator & Lead Developer",
	description: "Designed, architected, and developed the complete UNIFY platform from concept to implementation, including the system architecture, user experience, backend design, frontend development, and overall product vision.",
	portfolio: "https://taimur.dev",
	linkedin: "https://www.linkedin.com/in/shoaaib-taimur/"
}, {
	name: "Toufiq Hasan Kiron",
	role: "UI Refinement & Project Contributor",
	description: "Contributed to refining the user interface, improving usability, and enhancing the overall user experience through design feedback and implementation improvements.",
	portfolio: "https://kiron.dev",
	linkedin: "https://www.linkedin.com/in/toufiq-hasan-kiron/"
}];
function CreditsDialog() {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "text-muted-foreground transition-colors hover:text-foreground",
				children: "Credits"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-display text-2xl",
				children: "Built by"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "The people behind UNIFY." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 py-2 sm:grid-cols-2",
				children: CREDITS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-base font-semibold text-foreground",
							children: c.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-0.5 text-xs uppercase tracking-wide text-accent",
							children: c.role
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-muted-foreground",
							children: c.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: c.portfolio,
									target: "_blank",
									rel: "noreferrer",
									className: "text-xs font-medium text-primary hover:underline",
									children: "Portfolio ↗"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-border",
									children: "•"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: c.linkedin,
									target: "_blank",
									rel: "noreferrer",
									className: "text-xs font-medium text-primary hover:underline",
									children: "LinkedIn ↗"
								})
							]
						})
					]
				}, c.name))
			})]
		})]
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-16 border-t border-border/60 bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-sm text-sm text-muted-foreground",
				children: "One place for every academic activity."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-x-6 gap-y-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "text-muted-foreground hover:text-foreground",
						children: "Privacy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "text-muted-foreground hover:text-foreground",
						children: "Terms"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "text-muted-foreground hover:text-foreground",
						children: "About"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditsDialog, {})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border/60 py-4 text-center text-xs text-muted-foreground",
			children: [
				"© ",
				(/* @__PURE__ */ new Date()).getFullYear(),
				" UNIFY — All rights reserved."
			]
		})]
	});
}
var Toaster$1 = ({ className, icons, toastOptions, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		...props,
		richColors: false,
		className: ["toaster group", className].filter(Boolean).join(" "),
		icons: {
			success: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-primary" }),
			info: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4 w-4 text-primary" }),
			warning: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-accent" }),
			error: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 text-destructive" }),
			loading: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-primary" }),
			...icons ?? {}
		},
		toastOptions: {
			...toastOptions,
			classNames: {
				toast: "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:shadow-card",
				success: "group-[.toaster]:border-primary/40",
				info: "group-[.toaster]:border-primary/40",
				warning: "group-[.toaster]:border-accent/50",
				error: "group-[.toaster]:border-destructive/50",
				description: "group-[.toast]:text-muted-foreground",
				actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
				cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
				closeButton: "group-[.toast]:border-border group-[.toast]:bg-card group-[.toast]:text-card-foreground",
				...toastOptions?.classNames ?? {}
			}
		}
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-7xl font-bold text-primary",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-display text-xl font-semibold",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Back to UNIFY"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-semibold",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong. You can try again or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$11 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "UNIFY — One place for every academic activity" },
			{
				name: "description",
				content: "UNIFY helps university students, CRs, teachers, and admins track class tests, labs, viva, assignments, and exams — organized by Department, Batch, and Section."
			},
			{
				name: "author",
				content: "UNIFY"
			},
			{
				property: "og:title",
				content: "UNIFY — One place for every academic activity"
			},
			{
				property: "og:description",
				content: "A premium academic activity portal for universities. See what's today, what's next, and what's coming up — for your class."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$11.useRouteContext();
	const routeState = useRouterState({ select: (s) => ({
		pathname: s.location.pathname,
		routeIds: s.matches.map((match) => match.routeId)
	}) });
	const { theme } = useTheme();
	const bare = [
		"/login",
		"/change-password",
		"/admin",
		"/cr",
		"/teacher"
	].some((root) => routeState.pathname === root || routeState.pathname.startsWith(`${root}/`) || routeState.routeIds.includes(root));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-screen flex-col bg-background text-foreground",
			children: [
				!bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				}),
				!bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "top-right",
			theme,
			closeButton: true
		})]
	});
}
var $$splitComponentImporter$10 = () => import("./routes-D361QBnR.mjs");
var Route$10 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "UNIFY — Your class dashboard" },
		{
			name: "description",
			content: "See today's activities, your next deadline, and what's coming up for your section."
		},
		{
			property: "og:title",
			content: "UNIFY — Your class dashboard"
		},
		{
			property: "og:description",
			content: "See today's activities, your next deadline, and what's coming up for your section."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./activities-US69zoIS.mjs");
var Route$9 = createFileRoute("/activities")({
	head: () => ({ meta: [
		{ title: "Activities — UNIFY" },
		{
			name: "description",
			content: "Search, filter, and browse every academic activity for your class."
		},
		{
			property: "og:title",
			content: "Activities — UNIFY"
		},
		{
			property: "og:description",
			content: "Search, filter, and browse every academic activity for your class."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./calendar-MUxAZiye.mjs");
var Route$8 = createFileRoute("/calendar")({
	head: () => ({ meta: [
		{ title: "Calendar — UNIFY" },
		{
			name: "description",
			content: "Monthly calendar of every class test, lab, viva, assignment, and exam."
		},
		{
			property: "og:title",
			content: "Calendar — UNIFY"
		},
		{
			property: "og:description",
			content: "Monthly calendar of every class test, lab, viva, assignment, and exam."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./change-password-B6EHk-CZ.mjs");
var Route$7 = createFileRoute("/change-password")({
	head: () => ({ meta: [
		{ title: "Change password — UNIFY" },
		{
			name: "description",
			content: "Set a new password for your UNIFY account."
		},
		{
			property: "og:title",
			content: "Change password — UNIFY"
		},
		{
			property: "og:description",
			content: "Set a new password for your UNIFY account."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./login-DChsbvIq.mjs");
var Route$6 = createFileRoute("/login")({
	head: () => ({ meta: [
		{ title: "Sign in — UNIFY" },
		{
			name: "description",
			content: "Sign in to UNIFY as CR, Teacher, or Admin to manage academic activities."
		},
		{
			property: "og:title",
			content: "Sign in — UNIFY"
		},
		{
			property: "og:description",
			content: "Sign in to manage academic activities."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./teacher-BDvCXYfJ.mjs");
var Route$5 = createFileRoute("/teacher")({
	head: () => ({ meta: [
		{ title: "Teacher Dashboard — UNIFY" },
		{
			name: "description",
			content: "Manage activities across every batch and section in your department."
		},
		{
			property: "og:title",
			content: "Teacher Dashboard — UNIFY"
		},
		{
			property: "og:description",
			content: "Manage academic activities across your department."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./admin.index-CatWrfZT.mjs");
var Route$4 = createFileRoute("/admin/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./admin.activities-BuyCMLD6.mjs");
var Route$3 = createFileRoute("/admin/activities")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./admin.organization-c3oO7vPD.mjs");
var Route$2 = createFileRoute("/admin/organization")({
	head: () => ({ meta: [
		{ title: "Organization — UNIFY Admin" },
		{
			name: "description",
			content: "Manage departments, batches, and sections all in one place."
		},
		{
			property: "og:title",
			content: "Organization — UNIFY Admin"
		},
		{
			property: "og:description",
			content: "Departments, batches, and sections."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin.settings-Cmn3zlXY.mjs");
var Route$1 = createFileRoute("/admin/settings")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./admin.users-CWFwHOez.mjs");
var Route = createFileRoute("/admin/users")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$10.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$11
});
var ActivitiesRoute = Route$9.update({
	id: "/activities",
	path: "/activities",
	getParentRoute: () => Route$11
});
var AdminRoute = Route$12.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$11
});
var CalendarRoute = Route$8.update({
	id: "/calendar",
	path: "/calendar",
	getParentRoute: () => Route$11
});
var ChangePasswordRoute = Route$7.update({
	id: "/change-password",
	path: "/change-password",
	getParentRoute: () => Route$11
});
var CrRoute = Route$13.update({
	id: "/cr",
	path: "/cr",
	getParentRoute: () => Route$11
});
var LoginRoute = Route$6.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$11
});
var TeacherRoute = Route$5.update({
	id: "/teacher",
	path: "/teacher",
	getParentRoute: () => Route$11
});
var AdminIndexRoute = Route$4.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminRoute
});
var AdminRouteChildren = {
	AdminActivitiesRoute: Route$3.update({
		id: "/activities",
		path: "/activities",
		getParentRoute: () => AdminRoute
	}),
	AdminOrganizationRoute: Route$2.update({
		id: "/organization",
		path: "/organization",
		getParentRoute: () => AdminRoute
	}),
	AdminSettingsRoute: Route$1.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => AdminRoute
	}),
	AdminUsersRoute: Route.update({
		id: "/users",
		path: "/users",
		getParentRoute: () => AdminRoute
	}),
	AdminIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	ActivitiesRoute,
	AdminRoute: AdminRoute._addFileChildren(AdminRouteChildren),
	CalendarRoute,
	ChangePasswordRoute,
	CrRoute,
	LoginRoute,
	TeacherRoute
};
var routeTree = Route$11._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
