import { readConfig } from "./config.js";

export async function api(path, options = {}) {
  const config = readConfig();
  const baseUrl = config.apiUrl || "https://humanonly.io/api/v1";
  const token = config.token;

  const { body, ...rest } = options;
  const headers = { "X-Requested-With": "XMLHttpRequest", ...options.headers };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const fetchOpts = { ...rest, headers };

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    fetchOpts.body = JSON.stringify(body);
  } else if (body) {
    fetchOpts.body = body;
  }

  const res = await fetch(`${baseUrl}${path}`, fetchOpts);

  if (res.status === 401) throw new Error("Session expired. Run `ho login` to re-authenticate.");
  if (res.status === 403 || res.status === 404) throw new Error("Resource not found.");
  if (res.status === 503) {
    const data = await res.json().catch(() => ({}));
    if (data?.error?.code === "MAINTENANCE") throw new Error("HumanOnly is undergoing maintenance. Please try again later.");
    throw new Error("Service unavailable.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `Request failed (${res.status})`);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}
