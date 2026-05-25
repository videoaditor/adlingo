// Auth — editor login is by email (looked up server-side). Admin login posts the
// password to the server, which returns a short-lived bearer token stored in
// sessionStorage and sent on admin endpoints.

const STORAGE_KEY = 'adlingo_auth';
const ADMIN_TOKEN_KEY = 'adlingo_admin_token';

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

export async function checkAdminPassword(password) {
  if (!password) return false;
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function hasAdminToken() {
  return !!sessionStorage.getItem(ADMIN_TOKEN_KEY);
}
