import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { i as setClassSelection, n as getClassSelection } from "./session-Dp3oTrTK.mjs";
import { t as api } from "./api-BT53Ph7o.mjs";
import { P as ArrowRight, l as PartyPopper, o as Settings2 } from "../_libs/lucide-react.mjs";
import { l as isSameDay, s as differenceInSeconds } from "../_libs/date-fns.mjs";
import { t as ActivityCard } from "./ActivityCard-BJzTutBw.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Logo } from "./Logo-Cejf3dcr.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-C5ptT7lJ.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DUy71i1r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D361QBnR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ClassSelectionDialog({ open, onOpenChange, initial }) {
	const [departmentId, setDepartmentId] = (0, import_react.useState)(initial?.departmentId ?? "");
	const [batchId, setBatchId] = (0, import_react.useState)(initial?.batchId ?? "");
	const [sectionId, setSectionId] = (0, import_react.useState)(initial?.sectionId ?? "");
	(0, import_react.useEffect)(() => {
		if (open) {
			const s = initial ?? getClassSelection();
			setDepartmentId(s?.departmentId ?? "");
			setBatchId(s?.batchId ?? "");
			setSectionId(s?.sectionId ?? "");
		}
	}, [open, initial]);
	const departments = useQuery({
		queryKey: ["departments"],
		queryFn: () => api.listDepartments()
	});
	const batches = useQuery({
		queryKey: ["batches", departmentId],
		enabled: !!departmentId,
		queryFn: () => api.listBatches(departmentId)
	});
	const sections = useQuery({
		queryKey: ["sections", batchId],
		enabled: !!batchId,
		queryFn: () => api.listSections(batchId)
	});
	const canContinue = departmentId && batchId && sectionId;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 flex justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
							showWordmark: false,
							size: 44
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "text-center font-display text-2xl",
						children: "Select your class"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-center",
						children: "Pick your Department, Batch, and Section. You can change this anytime."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Department"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: departmentId,
								onValueChange: (v) => {
									setDepartmentId(v);
									setBatchId("");
									setSectionId("");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select department" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: departments.data?.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: d.id,
									children: d.name
								}, d.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Batch"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: batchId,
								onValueChange: (v) => {
									setBatchId(v);
									setSectionId("");
								},
								disabled: !departmentId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select batch" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: batches.data?.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: b.id,
									children: b.name
								}, b.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Section"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: sectionId,
								onValueChange: setSectionId,
								disabled: !batchId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select section" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: sections.data?.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s.id,
									children: s.name
								}, s.id)) })]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-2 h-11 w-full rounded-xl text-base",
					disabled: !canContinue,
					onClick: () => {
						setClassSelection({
							departmentId,
							batchId,
							sectionId
						});
						onOpenChange(false);
					},
					children: "Continue"
				})
			]
		})
	});
}
function useTicker(ms = 1e3) {
	const [, set] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => set((n) => n + 1), ms);
		return () => clearInterval(id);
	}, [ms]);
}
function useClass() {
	const [sel, setSel] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const sync = () => setSel(getClassSelection());
		sync();
		window.addEventListener("unify:class-changed", sync);
		return () => window.removeEventListener("unify:class-changed", sync);
	}, []);
	return sel;
}
function nextActivityDate(a) {
	return new Date(a.startDate ?? a.date);
}
function StudentDashboard() {
	const cls = useClass();
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	useTicker(1e3);
	(0, import_react.useEffect)(() => {
		if (!cls) setDialogOpen(true);
	}, [cls]);
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
	const activities = useQuery({
		queryKey: ["activities", cls],
		enabled: !!cls,
		queryFn: () => api.listActivities(cls)
	});
	const meta = (0, import_react.useMemo)(() => {
		if (!cls) return null;
		return {
			dep: departments.data?.find((d) => d.id === cls.departmentId)?.name,
			bat: batches.data?.find((b) => b.id === cls.batchId)?.name,
			sec: sections.data?.find((s) => s.id === cls.sectionId)?.name
		};
	}, [
		cls,
		departments.data,
		batches.data,
		sections.data
	]);
	const now = /* @__PURE__ */ new Date();
	const upcoming = (0, import_react.useMemo)(() => (activities.data ?? []).filter((a) => nextActivityDate(a) >= new Date(now.getFullYear(), now.getMonth(), now.getDate())).sort((a, b) => nextActivityDate(a).getTime() - nextActivityDate(b).getTime()), [activities.data, now]);
	const todays = (0, import_react.useMemo)(() => (activities.data ?? []).filter((a) => a.date && isSameDay(new Date(a.date), now)), [activities.data, now]);
	const next = upcoming[0];
	const nextDelta = next ? differenceInSeconds(nextActivityDate(next), now) : 0;
	const upNext2 = upcoming.filter((a) => a.id !== next?.id).slice(0, 2);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassSelectionDialog, {
			open: dialogOpen,
			onOpenChange: setDialogOpen,
			initial: cls
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20 lg:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-start justify-between gap-6 md:flex-row md:items-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-widest text-accent",
							children: "Your class"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl leading-tight text-foreground sm:text-5xl",
							children: meta?.dep ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								meta.dep,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "·"
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-primary",
									children: meta.bat
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "·"
								}),
								" ",
								meta.sec
							] }) : "Welcome to UNIFY"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-muted-foreground",
							children: meta ? "Everything happening in your class — at a glance." : "Pick your class to see your activities."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "rounded-full",
							onClick: () => {
								setClassSelection({
									departmentId: "",
									batchId: "",
									sectionId: ""
								});
								setDialogOpen(true);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "mr-2 h-4 w-4" }), " Change class"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/activities",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "rounded-full",
								children: ["View all activities ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 h-4 w-4" })]
							})
						})]
					})]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 flex items-center gap-2 font-display text-xl font-semibold",
						children: "Today's activities"
					}),
					todays.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyPopper, { className: "h-8 w-8 text-accent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-lg font-medium",
								children: "No activities today."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Enjoy your day — we'll let you know what's next below."
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: todays.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityCard, { activity: a }, a.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-10 mb-3 font-display text-xl font-semibold",
						children: "Upcoming"
					}),
					upNext2.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Nothing else on the horizon."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: upNext2.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityCard, { activity: a }, a.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/activities",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "rounded-full",
								children: "View all"
							})
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-24 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--primary-deep)] p-6 text-primary-foreground shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-widest opacity-70",
					children: "Next activity"
				}), next ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-2 font-display text-2xl leading-tight",
						children: next.subject
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm opacity-80",
						children: next.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 grid grid-cols-3 gap-3",
						children: countdown(nextDelta).map(([n, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-white/10 px-3 py-4 text-center backdrop-blur-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-3xl font-semibold tabular-nums",
								children: n
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-[10px] uppercase tracking-widest opacity-80",
								children: l
							})]
						}, l))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-sm opacity-80",
						children: ["Starts ", nextActivityDate(next).toLocaleString(void 0, {
							weekday: "long",
							month: "short",
							day: "numeric",
							hour: "numeric",
							minute: "2-digit"
						})]
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm opacity-80",
					children: "Nothing scheduled yet."
				})]
			}) })]
		})
	] });
}
function countdown(totalSeconds) {
	if (totalSeconds <= 0) return [
		[0, "Days"],
		[0, "Hours"],
		[0, "Minutes"]
	];
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor(totalSeconds % 86400 / 3600);
	const mins = Math.floor(totalSeconds % 3600 / 60);
	return [
		[days, "Days"],
		[hours, "Hours"],
		[mins, "Minutes"]
	];
}
//#endregion
export { StudentDashboard as component };
