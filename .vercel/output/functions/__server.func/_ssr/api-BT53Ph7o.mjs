//#region node_modules/.nitro/vite/services/ssr/assets/api-BT53Ph7o.js
var isApiConfigured = Boolean(void 0);
function requireApiUrl() {
	throw new Error("Backend not configured. Set VITE_API_URL to your deployed API URL (e.g. https://your-backend.vercel.app).");
}
async function http(path, init) {
	const base = requireApiUrl();
	const token = typeof window !== "undefined" ? localStorage.getItem("unify_token") : null;
	const res = await fetch(`${base}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...token ? { Authorization: `Bearer ${token}` } : {},
			...init?.headers
		}
	});
	if (!res.ok) {
		let msg = `API ${res.status}`;
		try {
			const body = await res.json();
			if (body?.error) msg = typeof body.error === "string" ? body.error : JSON.stringify(body.error);
		} catch {
			try {
				msg = await res.text() || msg;
			} catch {}
		}
		throw new Error(msg);
	}
	if (res.status === 204) return void 0;
	return res.json();
}
var api = {
	listDepartments: () => http("/api/departments"),
	listBatches: (departmentId) => http(`/api/batches${departmentId ? `?departmentId=${departmentId}` : ""}`),
	listSections: (batchId) => http(`/api/sections${batchId ? `?batchId=${batchId}` : ""}`),
	createDepartment: (name) => http("/api/departments", {
		method: "POST",
		body: JSON.stringify({ name })
	}),
	createBatch: (departmentId, name) => http("/api/batches", {
		method: "POST",
		body: JSON.stringify({
			departmentId,
			name
		})
	}),
	createSection: (batchId, name) => http("/api/sections", {
		method: "POST",
		body: JSON.stringify({
			batchId,
			name
		})
	}),
	listActivities: (filter) => {
		const qs = filter ? new URLSearchParams(filter).toString() : "";
		return http(`/api/activities${qs ? `?${qs}` : ""}`);
	},
	createActivity: (input) => http("/api/activities", {
		method: "POST",
		body: JSON.stringify(input)
	}),
	updateActivity: (id, patch) => http(`/api/activities/${id}`, {
		method: "PATCH",
		body: JSON.stringify(patch)
	}),
	deleteActivity: (id) => http(`/api/activities/${id}`, { method: "DELETE" }),
	listUsers: () => http("/api/users"),
	login: (email, password) => http("/api/auth/login", {
		method: "POST",
		body: JSON.stringify({
			email,
			password
		})
	}),
	changePassword: (current, next) => http("/api/auth/change-password", {
		method: "POST",
		body: JSON.stringify({
			current,
			next
		})
	})
};
//#endregion
export { isApiConfigured as n, api as t };
