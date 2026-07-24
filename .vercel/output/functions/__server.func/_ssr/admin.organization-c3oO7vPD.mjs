import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { t as api } from "./api-BT53Ph7o.mjs";
import { N as Building2, S as GraduationCap, y as Layers } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-DicJzR9-.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DUy71i1r.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.organization-c3oO7vPD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrganizationPage() {
	const qc = useQueryClient();
	const deps = useQuery({
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
	const [depName, setDepName] = (0, import_react.useState)("");
	const createDep = useMutation({
		mutationFn: (n) => api.createDepartment(n),
		onSuccess: () => {
			toast.success("Department created");
			setDepName("");
			qc.invalidateQueries({ queryKey: ["departments"] });
		}
	});
	const [batchName, setBatchName] = (0, import_react.useState)("");
	const [batchDep, setBatchDep] = (0, import_react.useState)("");
	const createBatch = useMutation({
		mutationFn: () => api.createBatch(batchDep, batchName),
		onSuccess: () => {
			toast.success("Batch created");
			setBatchName("");
			qc.invalidateQueries({ queryKey: ["batches", "all"] });
		}
	});
	const [secName, setSecName] = (0, import_react.useState)("");
	const [secDep, setSecDep] = (0, import_react.useState)("");
	const [secBatch, setSecBatch] = (0, import_react.useState)("");
	const createSection = useMutation({
		mutationFn: () => api.createSection(secBatch, secName),
		onSuccess: () => {
			toast.success("Section created");
			setSecName("");
			qc.invalidateQueries({ queryKey: ["sections", "all"] });
		}
	});
	batchDep && (batches.data ?? []).filter((b) => b.departmentId === batchDep);
	const secFilteredBatches = secDep ? (batches.data ?? []).filter((b) => b.departmentId === secDep) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl sm:text-4xl",
			children: "Organization"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "Departments, batches, and sections — everything in one structured place."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormCard, {
					icon: Building2,
					title: "Add department",
					onSubmit: () => depName && createDep.mutate(depName),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: depName,
						onChange: (e) => setDepName(e.target.value),
						placeholder: "e.g. CSE",
						className: "rounded-xl"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: !depName || createDep.isPending,
						className: "w-full rounded-xl",
						children: "Add department"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormCard, {
					icon: Layers,
					title: "Add batch",
					onSubmit: () => batchName && batchDep && createBatch.mutate(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: batchDep,
							onValueChange: setBatchDep,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select department" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: deps.data?.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: d.id,
								children: d.name
							}, d.id)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: batchName,
							onChange: (e) => setBatchName(e.target.value),
							placeholder: "e.g. Batch 17",
							className: "rounded-xl"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: !batchName || !batchDep || createBatch.isPending,
							className: "w-full rounded-xl",
							children: "Add batch"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormCard, {
					icon: GraduationCap,
					title: "Add section",
					onSubmit: () => secName && secBatch && createSection.mutate(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: secDep,
							onValueChange: (v) => {
								setSecDep(v);
								setSecBatch("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select department" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: deps.data?.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: d.id,
								children: d.name
							}, d.id)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: secBatch,
							onValueChange: setSecBatch,
							disabled: !secDep,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: secDep ? "Select batch" : "Select department first" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: secFilteredBatches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: b.id,
								children: b.name
							}, b.id)) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: secName,
							onChange: (e) => setSecName(e.target.value),
							placeholder: "e.g. Section A",
							className: "rounded-xl"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: !secName || !secBatch || createSection.isPending,
							className: "w-full rounded-xl",
							children: "Add section"
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Structure"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Every department, its batches, and their sections."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-4",
					children: [(deps.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground",
						children: "No departments yet. Add one above to get started."
					}), (deps.data ?? []).map((d) => {
						const depBatches = (batches.data ?? []).filter((b) => b.departmentId === d.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-border bg-card p-5 shadow-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-display text-lg",
									children: d.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										depBatches.length,
										" batch",
										depBatches.length === 1 ? "" : "es"
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid gap-3 md:grid-cols-2",
								children: [depBatches.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground",
									children: "No batches in this department yet."
								}), depBatches.map((b) => {
									const batchSections = (sections.data ?? []).filter((s) => s.batchId === b.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border bg-background/60 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-4 w-4 text-primary" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-medium",
													children: b.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "ml-auto text-xs text-muted-foreground",
													children: [batchSections.length, " sections"]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex flex-wrap gap-1.5",
											children: [batchSections.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "No sections yet."
											}), batchSections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-3 w-3" }),
													" ",
													s.name
												]
											}, s.id))]
										})]
									}, b.id);
								})]
							})]
						}, d.id);
					})]
				})
			]
		})
	] });
}
function FormCard({ icon: Icon, title, onSubmit, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			onSubmit();
		},
		className: "rounded-2xl border border-border bg-card p-5 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-base",
				children: title
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-2",
			children
		})]
	});
}
//#endregion
export { OrganizationPage as component };
