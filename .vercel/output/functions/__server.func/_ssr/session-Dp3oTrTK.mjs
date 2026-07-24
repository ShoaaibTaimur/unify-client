//#region node_modules/.nitro/vite/services/ssr/assets/session-Dp3oTrTK.js
var CLASS_KEY = "unify_class";
var TOKEN_KEY = "unify_token";
var USER_KEY = "unify_user";
function getClassSelection() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(CLASS_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function setClassSelection(sel) {
	localStorage.setItem(CLASS_KEY, JSON.stringify(sel));
	window.dispatchEvent(new Event("unify:class-changed"));
}
function getStoredUser() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(USER_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function setStoredSession(token, user) {
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
	window.dispatchEvent(new Event("unify:auth-changed"));
}
function clearStoredSession() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
	window.dispatchEvent(new Event("unify:auth-changed"));
}
//#endregion
export { setStoredSession as a, setClassSelection as i, getClassSelection as n, getStoredUser as r, clearStoredSession as t };
