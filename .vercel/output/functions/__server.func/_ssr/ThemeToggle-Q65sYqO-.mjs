import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { d as Moon, i as Sun } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ThemeToggle-Q65sYqO-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "unify_theme";
function apply(t) {
	document.documentElement.classList.toggle("dark", t === "dark");
}
function useTheme() {
	const [theme, setTheme] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
		const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
		const initial = stored ?? (prefersDark ? "dark" : "light");
		setTheme(initial);
		apply(initial);
		const sync = () => {
			const t = localStorage.getItem(KEY) ?? "light";
			setTheme(t);
			apply(t);
		};
		window.addEventListener("unify:theme-changed", sync);
		return () => window.removeEventListener("unify:theme-changed", sync);
	}, []);
	return {
		theme,
		toggle: (0, import_react.useCallback)(() => {
			const next = theme === "dark" ? "light" : "dark";
			localStorage.setItem(KEY, next);
			apply(next);
			setTheme(next);
			window.dispatchEvent(new Event("unify:theme-changed"));
		}, [theme])
	};
}
function ThemeToggle({ className }) {
	const { theme, toggle } = useTheme();
	const dark = theme === "dark";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		className: `rounded-full ${className ?? ""}`,
		"aria-label": dark ? "Switch to light mode" : "Switch to dark mode",
		onClick: toggle,
		children: dark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-5 w-5" })
	});
}
//#endregion
export { useTheme as n, ThemeToggle as t };
