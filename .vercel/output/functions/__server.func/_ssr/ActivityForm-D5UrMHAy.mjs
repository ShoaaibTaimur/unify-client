import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as cn, t as Button } from "./button-DRsC1qZi.mjs";
import { t as api } from "./api-BT53Ph7o.mjs";
import { n as ACTIVITY_TYPES } from "./types-CfYcemL6.mjs";
import { t as Input } from "./input-DicJzR9-.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-C5ptT7lJ.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DUy71i1r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ActivityForm-D5UrMHAy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
function ActivityFormDialog({ open, onOpenChange, editing, fixed, chooseBatchSection, chooseDepartment, createdBy }) {
	const qc = useQueryClient();
	const [type, setType] = (0, import_react.useState)("class-test");
	const [title, setTitle] = (0, import_react.useState)("");
	const [subject, setSubject] = (0, import_react.useState)("");
	const [room, setRoom] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)("");
	const [startDate, setStartDate] = (0, import_react.useState)("");
	const [endDate, setEndDate] = (0, import_react.useState)("");
	const [departmentId, setDepartmentId] = (0, import_react.useState)(fixed?.departmentId ?? "");
	const [batchId, setBatchId] = (0, import_react.useState)(fixed?.batchId ?? "");
	const [sectionId, setSectionId] = (0, import_react.useState)(fixed?.sectionId ?? "");
	const effectiveDepartmentId = fixed?.departmentId ?? departmentId;
	const allowChooseBatchSection = chooseBatchSection || chooseDepartment;
	(0, import_react.useEffect)(() => {
		if (!open) return;
		if (editing) {
			setType(editing.activityType);
			setTitle(editing.title);
			setSubject(editing.subject);
			setRoom(editing.room ?? "");
			setDescription(editing.description ?? "");
			setDate(editing.date ? editing.date.slice(0, 16) : "");
			setStartDate(editing.startDate ? editing.startDate.slice(0, 10) : "");
			setEndDate(editing.endDate ? editing.endDate.slice(0, 10) : "");
			setDepartmentId(editing.departmentId);
			setBatchId(editing.batchId);
			setSectionId(editing.sectionId);
		} else {
			setType("class-test");
			setTitle("");
			setSubject("");
			setRoom("");
			setDescription("");
			setDate("");
			setStartDate("");
			setEndDate("");
			setDepartmentId(fixed?.departmentId ?? "");
			setBatchId(fixed?.batchId ?? "");
			setSectionId(fixed?.sectionId ?? "");
		}
	}, [
		open,
		editing,
		fixed
	]);
	const departments = useQuery({
		queryKey: ["departments"],
		enabled: !!chooseDepartment,
		queryFn: () => api.listDepartments()
	});
	const batches = useQuery({
		queryKey: ["batches", effectiveDepartmentId],
		enabled: !!effectiveDepartmentId && !!allowChooseBatchSection,
		queryFn: () => api.listBatches(effectiveDepartmentId)
	});
	const sections = useQuery({
		queryKey: ["sections", batchId],
		enabled: !!batchId && !!allowChooseBatchSection,
		queryFn: () => api.listSections(batchId)
	});
	const isExam = ACTIVITY_TYPES.find((t) => t.value === type)?.isExam;
	const mutation = useMutation({
		mutationFn: async () => {
			const base = {
				departmentId: effectiveDepartmentId,
				batchId,
				sectionId,
				activityType: type,
				title,
				subject,
				room: room || void 0,
				description: description || void 0,
				createdBy,
				date: isExam ? void 0 : date ? new Date(date).toISOString() : void 0,
				startDate: isExam && startDate ? new Date(startDate).toISOString() : void 0,
				endDate: isExam && endDate ? new Date(endDate).toISOString() : void 0
			};
			if (editing) return api.updateActivity(editing.id, base);
			return api.createActivity(base);
		},
		onSuccess: () => {
			toast.success(editing ? "Activity updated" : "Activity created");
			qc.invalidateQueries({ queryKey: ["activities"] });
			onOpenChange(false);
		},
		onError: (e) => toast.error(e.message)
	});
	const canSubmit = title && subject && effectiveDepartmentId && batchId && sectionId && (isExam ? startDate && endDate : date);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display text-2xl",
					children: editing ? "Edit activity" : "New activity"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Activity type",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: type,
								onValueChange: (v) => setType(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ACTIVITY_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: t.value,
									children: t.label
								}, t.value)) })]
							})
						}),
						chooseDepartment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Department",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
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
							})
						}),
						allowChooseBatchSection && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Batch",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: batchId,
									onValueChange: (v) => {
										setBatchId(v);
										setSectionId("");
									},
									disabled: !effectiveDepartmentId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: effectiveDepartmentId ? "Select" : "Select department first" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: batches.data?.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: b.id,
										children: b.name
									}, b.id)) })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Section",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: sectionId,
									onValueChange: setSectionId,
									disabled: !batchId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: sections.data?.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s.id,
										children: s.name
									}, s.id)) })]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Title",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: title,
								onChange: (e) => setTitle(e.target.value),
								className: "rounded-xl"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Subject",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: subject,
								onChange: (e) => setSubject(e.target.value),
								className: "rounded-xl"
							})
						}),
						isExam ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Start date",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: startDate,
									onChange: (e) => setStartDate(e.target.value),
									className: "rounded-xl"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "End date",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: endDate,
									onChange: (e) => setEndDate(e.target.value),
									className: "rounded-xl"
								})
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Date & time",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "datetime-local",
									value: date,
									onChange: (e) => setDate(e.target.value),
									className: "rounded-xl"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Room",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: room,
									onChange: (e) => setRoom(e.target.value),
									className: "rounded-xl"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Description",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: description,
								onChange: (e) => setDescription(e.target.value),
								rows: 3,
								className: "rounded-xl"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: !canSubmit || mutation.isPending,
					onClick: () => mutation.mutate(),
					children: mutation.isPending ? "Saving…" : editing ? "Save changes" : "Create activity"
				})] })
			]
		})
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
			children: label
		}), children]
	});
}
function useActivityList(filter) {
	return useQuery({
		queryKey: ["activities", filter],
		queryFn: () => api.listActivities(filter)
	});
}
/** Simple manage table shared by CR and Teacher dashboards. */
function ManageActivitiesTable({ activities, onEdit, onDelete }) {
	const sorted = (0, import_react.useMemo)(() => [...activities].sort((a, b) => new Date(a.startDate ?? a.date).getTime() - new Date(b.startDate ?? b.date).getTime()), [activities]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-2xl border border-border bg-card",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[720px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left",
							children: "Title"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left",
							children: "Type"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left",
							children: "Subject"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left",
							children: "When"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-right",
							children: "Actions"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [sorted.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 5,
					className: "px-4 py-10 text-center text-muted-foreground",
					children: "No activities."
				}) }), sorted.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60 last:border-b-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-medium",
							children: a.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: ACTIVITY_TYPES.find((t) => t.value === a.activityType)?.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: a.subject
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 whitespace-nowrap",
							children: a.startDate ? `${new Date(a.startDate).toLocaleDateString()} – ${new Date(a.endDate).toLocaleDateString()}` : new Date(a.date).toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 text-right whitespace-nowrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => onEdit(a),
								children: "Edit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								className: "text-destructive",
								onClick: () => onDelete(a),
								children: "Delete"
							})]
						})
					]
				}, a.id))] })]
			})
		})
	});
}
//#endregion
export { ManageActivitiesTable as n, useActivityList as r, ActivityFormDialog as t };
