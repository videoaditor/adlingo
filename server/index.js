// adlingo proxy server
// - Holds the Airtable PAT server-side (no longer shipped to clients)
// - Token-bucket-limits outbound calls to Airtable (4 req/s, well under the 5/s ceiling)
// - Honors Retry-After on 429
// - Caches getAllPlayers for 30s (admin refreshes are free)
// - Coalesces per-player progress writes into one PATCH (debounce 500ms)
// - Issues short-lived admin tokens; admin endpoints require Bearer auth
// - Serves the built SPA from ../dist

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3001;
// Accept VITE_* fallbacks so the existing dev .env Just Works
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_API_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;
const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appP65kN7D9LjbXb0';
const TABLE = process.env.AIRTABLE_PLAYERS_TABLE || 'Players';
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

if (!AIRTABLE_API_KEY) console.error('[startup] AIRTABLE_API_KEY missing');
if (!ADMIN_PASSWORD) console.error('[startup] ADMIN_PASSWORD missing');

// ── Token bucket: 4 req/s to Airtable, refills continuously ────────────
const bucket = { tokens: 4, max: 4, refillPerSec: 4, last: Date.now() };
function takeToken() {
  return new Promise((resolve) => {
    const tick = () => {
      const now = Date.now();
      bucket.tokens = Math.min(
        bucket.max,
        bucket.tokens + ((now - bucket.last) / 1000) * bucket.refillPerSec,
      );
      bucket.last = now;
      if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return resolve();
      }
      const waitMs = Math.ceil(((1 - bucket.tokens) / bucket.refillPerSec) * 1000);
      setTimeout(tick, waitMs);
    };
    tick();
  });
}

// ── Airtable fetch: token bucket + Retry-After backoff on 429 ──────────
async function airtableFetch(url, opts = {}, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await takeToken();
    const res = await fetch(url, {
      ...opts,
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
      },
    });
    if (res.status !== 429 || attempt === maxRetries) return res;
    const headerVal = parseInt(res.headers.get('Retry-After') || '', 10);
    const waitSec = Math.min(Number.isFinite(headerVal) ? headerVal : 30, 60);
    await new Promise((r) => setTimeout(r, waitSec * 1000 + Math.random() * 500));
  }
}

// ── Mappers ────────────────────────────────────────────────────────────
function parseProgress(raw) {
  const empty = { completedLessons: [], scores: {}, xp: 0, streak: 0, lastActivity: null };
  if (!raw) return empty;
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p.completedLessons)) p.completedLessons = [...new Set(p.completedLessons)];
    return p;
  } catch {
    return empty;
  }
}
function recordToPlayer(r) {
  return {
    id: r.id,
    name: r.fields.Name || '',
    email: r.fields.Email || '',
    rank: r.fields.Rank || 'Unranked',
    trustScore: r.fields['Trust Score'] || 0,
    gold: r.fields.Gold || 0,
    progress: parseProgress(r.fields['AdLingo Progress']),
  };
}

// ── Cache for getAllPlayers (30s) ─────────────────────────────────────
let playersCache = { data: null, at: 0 };
const PLAYERS_TTL_MS = 30_000;

async function fetchAllPlayers() {
  const records = [];
  let offset = null;
  do {
    const url = offset ? `${BASE_URL}/${TABLE}?offset=${offset}` : `${BASE_URL}/${TABLE}`;
    const res = await airtableFetch(url);
    if (!res.ok) {
      const err = new Error(`Airtable ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    if (data.records) records.push(...data.records);
    offset = data.offset || null;
  } while (offset);
  return records.map(recordToPlayer);
}

// ── Per-recordId write queue: debounce 500ms, coalesce bursts ─────────
const WRITE_DEBOUNCE_MS = 500;
const writeQueue = new Map(); // recordId -> { progress, timer, resolvers }

function queueWrite(recordId, progress) {
  return new Promise((resolve, reject) => {
    let entry = writeQueue.get(recordId);
    if (entry) {
      clearTimeout(entry.timer);
      entry.progress = progress;
      entry.resolvers.push({ resolve, reject });
    } else {
      entry = { progress, resolvers: [{ resolve, reject }], timer: null };
      writeQueue.set(recordId, entry);
    }
    entry.timer = setTimeout(async () => {
      const e = writeQueue.get(recordId);
      writeQueue.delete(recordId);
      try {
        const res = await airtableFetch(`${BASE_URL}/${TABLE}/${recordId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            fields: { 'AdLingo Progress': JSON.stringify(e.progress) },
          }),
        });
        if (!res.ok) {
          const err = new Error(`Airtable ${res.status}`);
          err.status = res.status;
          throw err;
        }
        const out = await res.json();
        playersCache = { data: null, at: 0 }; // invalidate admin cache
        e.resolvers.forEach((r) => r.resolve(out));
      } catch (err) {
        e.resolvers.forEach((r) => r.reject(err));
      }
    }, WRITE_DEBOUNCE_MS);
  });
}

// ── Admin tokens (in-memory; survive restarts via re-login) ───────────
const ADMIN_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const adminTokens = new Map(); // token -> expiresAt

function issueAdminToken() {
  const t = crypto.randomBytes(32).toString('hex');
  adminTokens.set(t, Date.now() + ADMIN_TOKEN_TTL_MS);
  return t;
}
function isAdminTokenValid(t) {
  if (!t) return false;
  const exp = adminTokens.get(t);
  if (!exp) return false;
  if (Date.now() > exp) {
    adminTokens.delete(t);
    return false;
  }
  return true;
}
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const t = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!isAdminTokenValid(t)) return res.status(401).json({ error: 'unauthorized' });
  next();
}

// ── Per-IP rate limiting (defense-in-depth, not the main throttle) ────
const RPM_LIMIT = 120;
const ipBuckets = new Map();
function ipLimit(req, res, next) {
  const ip =
    req.ip ||
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    'unknown';
  const now = Date.now();
  const b = ipBuckets.get(ip);
  if (!b || now - b.windowStart > 60_000) {
    ipBuckets.set(ip, { count: 1, windowStart: now });
    return next();
  }
  b.count++;
  if (b.count > RPM_LIMIT) return res.status(429).json({ error: 'too many requests' });
  next();
}

// ── App ──────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '256kb' }));
app.use('/api', ipLimit);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Editor: look up player by email
app.get('/api/me', async (req, res) => {
  const email = (req.query.email || '').toString().trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'email required' });
  const sanitized = email.replace(/"/g, '\\"');
  const formula = encodeURIComponent(`{Email} = "${sanitized}"`);
  try {
    const r = await airtableFetch(
      `${BASE_URL}/${TABLE}?filterByFormula=${formula}&maxRecords=1`,
    );
    if (!r.ok) return res.status(r.status).json({ error: `airtable ${r.status}` });
    const data = await r.json();
    if (!data.records || data.records.length === 0) return res.json({ player: null });
    res.json({ player: recordToPlayer(data.records[0]) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Editor: save progress (coalesced per recordId)
app.post('/api/progress', async (req, res) => {
  const { recordId, progress } = req.body || {};
  if (!recordId || !progress || typeof progress !== 'object') {
    return res.status(400).json({ error: 'recordId and progress required' });
  }
  try {
    await queueWrite(recordId, progress);
    res.json({ ok: true });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Admin: login → token
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'invalid password' });
  }
  res.json({ token: issueAdminToken() });
});

// Admin: list players (cached 30s)
app.get('/api/admin/players', requireAdmin, async (req, res) => {
  try {
    const now = Date.now();
    if (playersCache.data && now - playersCache.at < PLAYERS_TTL_MS) {
      return res.json({ players: playersCache.data, cached: true });
    }
    const players = await fetchAllPlayers();
    playersCache = { data: players, at: now };
    res.json({ players, cached: false });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Admin: update rank
app.patch('/api/admin/rank', requireAdmin, async (req, res) => {
  const { recordId, rank } = req.body || {};
  if (!recordId || typeof rank !== 'string') {
    return res.status(400).json({ error: 'recordId, rank required' });
  }
  try {
    const r = await airtableFetch(`${BASE_URL}/${TABLE}/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields: { Rank: rank } }),
    });
    if (!r.ok) return res.status(r.status).json({ error: `airtable ${r.status}` });
    playersCache = { data: null, at: 0 };
    res.json({ ok: true });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Static SPA + fallback (last so /api/* still gets a 404 instead of index.html)
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => console.log(`[adlingo] server listening on :${PORT}`));
