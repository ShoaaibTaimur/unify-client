import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Logo-Cejf3dcr.js
var import_jsx_runtime = require_jsx_runtime();
/**
* UNIFY logo — a stylized "U" formed by two rounded uprights joined by a
* checkmark / calendar bar, with a small dusty-rose accent dot representing
* the "next activity" indicator. Flat, vector, theme-aware.
*/
function Logo({ size = 32, showWordmark = true, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `inline-flex items-center gap-2 ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			viewBox: "0 0 40 40",
			fill: "none",
			xmlns: "http://www.w3.org/2000/svg",
			"aria-label": "UNIFY",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M8 6v18a12 12 0 0 0 24 0V6",
					stroke: "currentColor",
					strokeWidth: "4",
					strokeLinecap: "round",
					fill: "none",
					className: "text-primary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M14 20l4 4 8-8",
					stroke: "currentColor",
					strokeWidth: "3",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					fill: "none",
					className: "text-primary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "32",
					cy: "8",
					r: "3",
					className: "fill-accent"
				})
			]
		}), showWordmark && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-2xl font-semibold tracking-tight text-foreground",
			children: "UNIFY"
		})]
	});
}
//#endregion
export { Logo as t };
