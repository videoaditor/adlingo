// Simple auth service — editors log in by email (looked up in Airtable)
// Admin uses a password gate

const ADMIN_PASSWORD = 'aditor2024';
const APP_PASSWORD = '404Error!';
const STORAGE_KEY = 'adlingo_auth';

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

export function checkAppPassword(password) {
  return password === APP_PASSWORD;
}
