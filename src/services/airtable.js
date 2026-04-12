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
  if (!raw) {
    return {
      completedLessons: [],
      scores: {},
      xp: 0,
      streak: 0,
      lastActivity: null,
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {
      completedLessons: [],
      scores: {},
      xp: 0,
      streak: 0,
      lastActivity: null,
    };
  }
}
