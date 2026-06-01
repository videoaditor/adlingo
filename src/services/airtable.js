// Client-side Airtable interface — talks to Airtable DIRECTLY from the browser.
//
// ⚠️ STATIC-SITE BUILD: there is no backend. The Airtable token is read from a
// build-time env var (VITE_AIRTABLE_API_KEY) and is therefore present in the
// shipped JS bundle — anyone can read it. Use a token scoped to ONLY this base
// with data read/write permissions, nothing else. (A server-side proxy in
// server/index.js still exists for local `dev:all`, but the static deployment
// does not use it.)
//
// Same export names as the proxy version so callers (App.jsx, Admin.jsx) don't change.

const BASE_ID = 'appP65kN7D9LjbXb0';
const TABLE = 'Players';
const PROGRESS_FIELD = 'AdLingo Progress';
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY || '';
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

if (!API_KEY) console.error('[airtable] VITE_AIRTABLE_API_KEY missing at build time');

const headers = () => ({
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
});

function parseProgress(raw) {
  const empty = { completedLessons: [], scores: {}, xp: 0, streak: 0, lastActivity: null };
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.completedLessons)) {
      parsed.completedLessons = [...new Set(parsed.completedLessons)];
    }
    return parsed;
  } catch {
    return empty;
  }
}

function shapePlayer(record) {
  return {
    id: record.id,
    name: record.fields.Name || '',
    email: record.fields.Email || '',
    rank: record.fields.Rank || 'Unranked',
    trustScore: record.fields['Trust Battery'] || 0,
    gold: record.fields.Gold || 0,
    progress: parseProgress(record.fields[PROGRESS_FIELD]),
  };
}

export async function findPlayerByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  try {
    // Escape double-quotes to prevent Airtable formula injection.
    const sanitized = email.trim().toLowerCase().replace(/"/g, '\\"');
    const formula = encodeURIComponent(`LOWER({Email}) = "${sanitized}"`);
    const res = await fetch(`${BASE_URL}/${TABLE}?filterByFormula=${formula}&maxRecords=1`, {
      headers: headers(),
    });
    if (!res.ok) {
      console.error(`[airtable] findPlayerByEmail failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (data.records && data.records.length > 0) return shapePlayer(data.records[0]);
    return null;
  } catch (err) {
    console.error('[airtable] findPlayerByEmail error:', err.message);
    return null;
  }
}

export async function savePlayerProgress(recordId, progress) {
  if (!recordId || typeof recordId !== 'string') return null;
  if (!progress || typeof progress !== 'object') return null;
  try {
    const res = await fetch(`${BASE_URL}/${TABLE}/${recordId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ fields: { [PROGRESS_FIELD]: JSON.stringify(progress) } }),
    });
    if (!res.ok) {
      console.error(`[airtable] savePlayerProgress failed: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('[airtable] savePlayerProgress error:', err.message);
    return null;
  }
}

export async function updatePlayerRank(recordId, rank) {
  if (!recordId || typeof recordId !== 'string') return null;
  if (!rank || typeof rank !== 'string') return null;
  try {
    const res = await fetch(`${BASE_URL}/${TABLE}/${recordId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ fields: { Rank: rank } }),
    });
    if (!res.ok) {
      console.error(`[airtable] updatePlayerRank failed: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('[airtable] updatePlayerRank error:', err.message);
    return null;
  }
}

// Throws on terminal failure so the admin UI can distinguish auth vs rate-limit.
export async function getAllPlayers() {
  const records = [];
  let offset = null;
  do {
    const url = offset ? `${BASE_URL}/${TABLE}?offset=${offset}` : `${BASE_URL}/${TABLE}`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      const err = new Error(`Airtable ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    if (data.records) records.push(...data.records);
    offset = data.offset || null;
  } while (offset);
  return records.map(shapePlayer);
}

// Merge two progress objects — never discard progress, always take the union
export function mergeProgress(local, remote) {
  const a = local || {};
  const b = remote || {};

  const completedLessons = [...new Set([
    ...(a.completedLessons || []),
    ...(b.completedLessons || []),
  ])];

  const allLessonIds = new Set([
    ...Object.keys(a.scores || {}),
    ...Object.keys(b.scores || {}),
  ]);
  const scores = {};
  for (const lid of allLessonIds) {
    const sa = (a.scores || {})[lid];
    const sb = (b.scores || {})[lid];
    if (sa && sb) {
      scores[lid] = (sa.correct || 0) >= (sb.correct || 0) ? sa : sb;
    } else {
      scores[lid] = sa || sb;
    }
  }

  const xp = Object.values(scores).reduce((sum, s) => {
    return sum + ((typeof s.correct === 'number' ? s.correct : 0) * 10);
  }, 0);

  const streak = Math.max(a.streak || 0, b.streak || 0);

  let lastActivity = null;
  if (a.lastActivity && b.lastActivity) {
    lastActivity = new Date(a.lastActivity) > new Date(b.lastActivity)
      ? a.lastActivity : b.lastActivity;
  } else {
    lastActivity = a.lastActivity || b.lastActivity || null;
  }

  return { completedLessons, scores, xp, streak, lastActivity };
}

// Retry queue — persists pending syncs to localStorage for offline resilience.
const PENDING_SYNC_KEY = 'adlingo_pending_sync';

function getPendingSync() {
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setPendingSync(entry) {
  if (entry) {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(entry));
  } else {
    localStorage.removeItem(PENDING_SYNC_KEY);
  }
}

export async function savePlayerProgressWithRetry(recordId, progress, onStatusChange) {
  if (!recordId || !progress) return null;

  setPendingSync({ recordId, progress });
  if (onStatusChange) onStatusChange('syncing');

  const delays = [1000, 2000, 4000];
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const result = await savePlayerProgress(recordId, progress);
      if (result) {
        setPendingSync(null);
        if (onStatusChange) onStatusChange('saved');
        return result;
      }
    } catch (err) {
      console.error(`[airtable] sync attempt ${attempt + 1} failed:`, err.message);
    }
    if (attempt < delays.length) {
      await new Promise(r => setTimeout(r, delays[attempt]));
    }
  }

  if (onStatusChange) onStatusChange('error');
  return null;
}

export async function flushPendingSync(onStatusChange) {
  const pending = getPendingSync();
  if (!pending) return;
  await savePlayerProgressWithRetry(pending.recordId, pending.progress, onStatusChange);
}
