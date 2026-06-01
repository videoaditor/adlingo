// Client-side auth — STATIC-SITE BUILD, no backend.
//
// Editors log in by email (looked up directly in Airtable). Admin login compares
// the entered password against a build-time env var.
//
// ⚠️ The admin password is read from VITE_ADMIN_PASSWORD and is present in the
// shipped JS bundle on a static site — it is a soft gate, not real security.
// Don't reuse it elsewhere. Real protection would require a backend (see
// server/index.js, used only for local `dev:all`).
//
// Same export names as the proxy version so callers (App.jsx, Admin.jsx) don't change.

const STORAGE_KEY = 'adlingo_auth';
const ADMIN_FLAG_KEY = 'adlingo_admin_token';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

if (!ADMIN_PASSWORD) console.error('[auth] VITE_ADMIN_PASSWORD missing at build time');

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeAuth(authData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

// async to preserve the existing `await checkAdminPassword(...)` call sites.
// On success, set a sessionStorage flag so the admin stays "in" across reloads
// within the tab (hasAdminToken reads it).
export async function checkAdminPassword(password) {
  const ok = !!password && password === ADMIN_PASSWORD;
  if (ok) sessionStorage.setItem(ADMIN_FLAG_KEY, '1');
  return ok;
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_FLAG_KEY);
}

export function hasAdminToken() {
  return !!sessionStorage.getItem(ADMIN_FLAG_KEY);
}
