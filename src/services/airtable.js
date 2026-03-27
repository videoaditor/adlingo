import CONFIG from '../config/airtable.js';

const BASE_URL = `https://api.airtable.com/v0/${CONFIG.baseId}`;

const headers = () => ({
  Authorization: `Bearer ${CONFIG.apiKey}`,
  'Content-Type': 'application/json',
});

// Find a player by email
export async function findPlayerByEmail(email) {
  const formula = encodeURIComponent(`{Email} = '${email}'`);
  const res = await fetch(
    `${BASE_URL}/${CONFIG.tables.players}?filterByFormula=${formula}&maxRecords=1`,
    { headers: headers() }
  );
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
}

// Save player progress to Airtable
export async function savePlayerProgress(recordId, progress) {
  const res = await fetch(`${BASE_URL}/${CONFIG.tables.players}/${recordId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({
      fields: {
        'AdLingo Progress': JSON.stringify(progress),
      },
    }),
  });
  return res.json();
}

// Update player rank
export async function updatePlayerRank(recordId, rank) {
  const res = await fetch(`${BASE_URL}/${CONFIG.tables.players}/${recordId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({
      fields: { Rank: rank },
    }),
  });
  return res.json();
}

// Get all players (for admin leaderboard)
export async function getAllPlayers() {
  const records = [];
  let offset = null;

  do {
    const url = offset
      ? `${BASE_URL}/${CONFIG.tables.players}?offset=${offset}`
      : `${BASE_URL}/${CONFIG.tables.players}`;
    const res = await fetch(url, { headers: headers() });
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
