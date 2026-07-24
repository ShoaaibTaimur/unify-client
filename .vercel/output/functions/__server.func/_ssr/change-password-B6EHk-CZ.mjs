import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { a as setStoredSession, r as getStoredUser } from "./session-Dp3oTrTK.mjs";
import { t as api } from "./api-BT53Ph7o.mjs";
import { t as Input } from "./input-DicJzR9-.mjs";
import { t as Logo } from "./Logo-Cejf3dcr.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/change-password-B6EHk-CZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChangePasswordPage() {
	const [current, setCurrent] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	async function onSubmit(e) {
		e.preventDefault();
		if (next.length < 6) return toast.error("Password must be at least 6 characters");
		if (next !== confirm) return toast.error("Passwords do not match");
		setLoading(true);
		try {
			await api.changePassword(current, next);
			const user = getStoredUser();
			if (user) setStoredSession(localStorage.getItem("unify_token"), {
				...user,
				mustChangePassword: false
			});
			toast.success("Password updated");
			navigate({ to: user?.role === "admin" ? "/admin" : user?.role === "teacher" ? "/teacher" : "/cr" });
		} catch (err) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-6 font-display text-2xl",
					children: "Change your password"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "You must set a new password before continuing."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-6 space-y-4",
					onSubmit,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Current password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								required: true,
								value: current,
								onChange: (e) => setCurrent(e.target.value),
								className: "h-11 rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "New password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								required: true,
								value: next,
								onChange: (e) => setNext(e.target.value),
								className: "h-11 rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Confirm new password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								required: true,
								value: confirm,
								onChange: (e) => setConfirm(e.target.value),
								className: "h-11 rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "h-11 w-full rounded-xl",
							disabled: loading,
							children: loading ? "Updating…" : "Update password"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { ChangePasswordPage as component };
