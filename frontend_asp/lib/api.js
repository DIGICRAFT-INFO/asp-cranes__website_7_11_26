// Centralized backend API configuration for the public frontend.
// Uses NEXT_PUBLIC_API_URL so the backend URL can be changed per-environment
// (local/staging/production) without touching component code.
const LOCAL_API_URL = 'http://localhost:5000/api';
const PRODUCTION_API_URL = 'https://asp-cranes-9-july-26.vercel.app/api';
const DEFAULT_API_URL = process.env.NODE_ENV === 'production'
  ? PRODUCTION_API_URL
  : LOCAL_API_URL;

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
export const API_URL =
  process.env.NODE_ENV === 'production' && envApiUrl === LOCAL_API_URL
    ? PRODUCTION_API_URL
    : envApiUrl || DEFAULT_API_URL;

/**
 * Small fetch wrapper that always talks to the backend API and
 * normalizes error handling across the app.
 *
 * @param {string} path - e.g. "/homepage", "/cranes/tower-crane"
 * @param {RequestInit} options
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok || (json && json.success === false)) {
    const message = json?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return json;
}

export default apiFetch;
