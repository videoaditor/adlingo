// Simple auth service — editors log in by email (looked up in Airtable)
// Admin uses a password gate

// Passwords should be set via environment variables — never hardcode in source
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const STORAGE_KEY = 'adlingo_auth';

if (!ADMIN_PASSWORD) {
  console.error('VITE_ADMIN_PASSWORD environment variable is required');
}

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

export function checkAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}
