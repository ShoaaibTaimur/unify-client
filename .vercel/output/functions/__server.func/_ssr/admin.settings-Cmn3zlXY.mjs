import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as isApiConfigured } from "./api-BT53Ph7o.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.settings-Cmn3zlXY.js
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl",
			children: "Settings"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "Environment and integration settings."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: "Backend"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: isApiConfigured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"Connected to ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: void 0 }),
					"."
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Not connected." }),
					" Deploy the API in ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "/server" }),
					" to Vercel, then set",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "VITE_API_URL" }),
					" to your backend URL (e.g. ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "https://your-app.vercel.app" }),
					")."
				] })
			})]
		})
	] });
}
//#endregion
export { SettingsPage as component };
