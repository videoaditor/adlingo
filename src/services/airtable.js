// Client-side Airtable interface — talks to our /api proxy, not Airtable directly.
// The PAT is held server-side; the client never sees it. Same export names as before
// so callers (App.jsx, Admin.jsx) don't need to change.

const TOKEN_KEY = 'adlingo_admin_token';
function adminToken() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

export async function findPlayerByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  try {
    const res = await fetch(`/api/me?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    if (!res.ok) {
      console.error(`[api] findPlayerByEmail failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.player || null;
  } catch (err) {
    console.error('[api] findPlayerByEmail error:', err.message);
    return null;
  }
}

export async function savePlayerProgress(recordId, progress) {
  if (!recordId || typeof recordId !== 'string') return null;
  if (!progress || typeof progress !== 'object') return null;
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, progress }),
    });
    if (!res.ok) {
      console.error(`[api] savePlayerProgress failed: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('[api] savePlayerProgress error:', err.message);
    return null;
  }
}

export async function updatePlayerRank(recordId, rank) {
  if (!recordId || typeof recordId !== 'string') return null;
  if (!rank || typeof rank !== 'string') return null;
  try {
    const res = await fetch('/api/admin/rank', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken()}`,
      },
      body: JSON.stringify({ recordId, rank }),
    });
    if (!res.ok) {
      console.error(`[api] updatePlayerRank failed: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('[api] updatePlayerRank error:', err.message);
    return null;
  }
}

// Throws on terminal failure so the admin UI can distinguish auth vs rate-limit vs empty.
export async function getAllPlayers() {
  const res = await fetch('/api/admin/players', {
    headers: { Authorization: `Bearer ${adminToken()}` },
  });
  if (!res.ok) {
    const err = new Error(`API ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return data.players || [];
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
// The server already coalesces and back-offs; this layer handles network failures.
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
      console.error(`[api] sync attempt ${attempt + 1} failed:`, err.message);
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
