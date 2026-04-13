import CONFIG from '../config/airtable.js';

const BASE_URL = `https://api.airtable.com/v0/${CONFIG.baseId}`;

const headers = () => ({
  Authorization: `Bearer ${CONFIG.apiKey}`,
  'Content-Type': 'application/json',
});

// Find a player by email
export async function findPlayerByEmail(email) {
  try {
    // Validate email parameter
    if (!email || typeof email !== 'string') {
      console.error('[Airtable] findPlayerByEmail: invalid email parameter');
      return null;
    }

    // Sanitize email to prevent Airtable formula injection
    const sanitizedEmail = email.trim().replace(/"/g, '\\"');
    const formula = encodeURIComponent(`{Email} = "${sanitizedEmail}"`);
    const res = await fetch(
      `${BASE_URL}/${CONFIG.tables.players}?filterByFormula=${formula}&maxRecords=1`,
      { headers: headers() }
    );
    if (!res.ok) {
      console.error(`[Airtable] findPlayerByEmail failed: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      return {
        id: record.id,
        name: record.fields.Name || '',
        email: record.fields.Email || '',
        rank: record.fields.Rank || 'Unranked',
        trustScore: record.fields['Trust Score'] || 0,
        gold: record.fields.Gold || 0,
        progress: parseProgress(record.fields['AdLingo Progress']),
      };
    }
    return null;
  } catch (err) {
    console.error('[Airtable] findPlayerByEmail error:', err.message);
    return null;
  }
}

// Save player progress to Airtable
export async function savePlayerProgress(recordId, progress) {
  try {
    // Validate parameters
    if (!recordId || typeof recordId !== 'string') {
      console.error('[Airtable] savePlayerProgress: invalid recordId');
      return null;
    }
    if (!progress || typeof progress !== 'object') {
      console.error('[Airtable] savePlayerProgress: invalid progress object');
      return null;
    }

    const res = await fetch(`${BASE_URL}/${CONFIG.tables.players}/${recordId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({
        fields: {
          'AdLingo Progress': JSON.stringify(progress),
        },
      }),
    });
    if (!res.ok) {
      console.error(`[Airtable] savePlayerProgress failed: ${res.status} ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('[Airtable] savePlayerProgress error:', err.message);
    return null;
  }
}

// Update player rank
export async function updatePlayerRank(recordId, rank) {
  try {
    // Validate parameters
    if (!recordId || typeof recordId !== 'string') {
      console.error('[Airtable] updatePlayerRank: invalid recordId');
      return null;
    }
    if (!rank || typeof rank !== 'string') {
      console.error('[Airtable] updatePlayerRank: invalid rank');
      return null;
    }

    const res = await fetch(`${BASE_URL}/${CONFIG.tables.players}/${recordId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({
        fields: { Rank: rank },
      }),
    });
    if (!res.ok) {
      console.error(`[Airtable] updatePlayerRank failed: ${res.status} ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('[Airtable] updatePlayerRank error:', err.message);
    return null;
  }
}

// Get all players (for admin leaderboard)
export async function getAllPlayers() {
  try {
    const records = [];
    let offset = null;

    do {
      const url = offset
        ? `${BASE_URL}/${CONFIG.tables.players}?offset=${offset}`
        : `${BASE_URL}/${CONFIG.tables.players}`;
      const res = await fetch(url, { headers: headers() });
      if (!res.ok) {
        console.error(`[Airtable] getAllPlayers failed: ${res.status} ${res.statusText}`);
        return [];
      }
      const data = await res.json();
      if (data.records) records.push(...data.records);
      offset = data.offset || null;
    } while (offset);

    return records.map((r) => ({
      id: r.id,
      name: r.fields.Name || '',
      email: r.fields.Email || '',
      rank: r.fields.Rank || 'Unranked',
      trustScore: r.fields['Trust Score'] || 0,
      gold: r.fields.Gold || 0,
      progress: parseProgress(r.fields['AdLingo Progress']),
    }));
  } catch (err) {
    console.error('[Airtable] getAllPlayers error:', err.message);
    return [];
  }
}

function parseProgress(raw) {
  const empty = {
    completedLessons: [],
    scores: {},
    xp: 0,
    streak: 0,
    lastActivity: null,
  };
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw);
    // Deduplicate completedLessons on load
    if (Array.isArray(parsed.completedLessons)) {
      parsed.completedLessons = [...new Set(parsed.completedLessons)];
    }
    return parsed;
  } catch {
    return empty;
  }
}

// Merge two progress objects — never discard progress, always take the union
export function mergeProgress(local, remote) {
  const a = local || {};
  const b = remote || {};

  // Union of completed lessons (deduplicated)
  const completedLessons = [...new Set([
    ...(a.completedLessons || []),
    ...(b.completedLessons || []),
  ])];

  // For scores, keep whichever has more correct answers per lesson
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

  // Recalculate XP from merged scores
  const xp = Object.values(scores).reduce((sum, s) => {
    return sum + ((typeof s.correct === 'number' ? s.correct : 0) * 10);
  }, 0);

  // Keep higher streak
  const streak = Math.max(a.streak || 0, b.streak || 0);

  // Keep more recent lastActivity
  let lastActivity = null;
  if (a.lastActivity && b.lastActivity) {
    lastActivity = new Date(a.lastActivity) > new Date(b.lastActivity)
      ? a.lastActivity : b.lastActivity;
  } else {
    lastActivity = a.lastActivity || b.lastActivity || null;
  }

  return { completedLessons, scores, xp, streak, lastActivity };
}

// Retry queue — persists pending syncs to localStorage
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

// Save with retry (up to 3 attempts, exponential backoff)
export async function savePlayerProgressWithRetry(recordId, progress, onStatusChange) {
  if (!recordId || !progress) return null;

  // Clear any stale pending sync for a different record
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
      console.error(`[Airtable] sync attempt ${attempt + 1} failed:`, err.message);
    }
    if (attempt < delays.length) {
      await new Promise(r => setTimeout(r, delays[attempt]));
    }
  }

  // All retries exhausted — pending sync stays in localStorage for next load
  if (onStatusChange) onStatusChange('error');
  return null;
}

// Flush any pending sync from a previous session
export async function flushPendingSync(onStatusChange) {
  const pending = getPendingSync();
  if (!pending) return;
  await savePlayerProgressWithRetry(pending.recordId, pending.progress, onStatusChange);
}
