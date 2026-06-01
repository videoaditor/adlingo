// Airtable-backed content store. Airtable is the source of truth for course
// content (worlds + disciplines); the synchronous courseData cache serves reads.
//
// Requires two manually-created tables in base appP65kN7D9LjbXb0:
//   - "AdLingo Content"         : Key (text), Content JSON (long text),
//                                 Updated At (text), Updated By (text)
//   - "AdLingo Content Backups" : Snapshot JSON (long text), Saved At (text),
//                                 Saved By (text)
import { AIRTABLE_BASE_URL, airtableHeaders } from './airtable';
import { applyContent, getLocalContent } from '../data/courseData';

const CONTENT_TABLE = 'AdLingo Content';
const BACKUPS_TABLE = 'AdLingo Content Backups';
const CONTENT_KEY = 'live';

function tableUrl(table, suffix = '') {
  return `${AIRTABLE_BASE_URL}/${encodeURIComponent(table)}${suffix}`;
}

// Returns the raw live record ({ id, fields }) or null. Throws on HTTP/network
// failure so callers can distinguish "absent" (null) from "unreachable" (throw).
async function fetchLiveRecord() {
  const formula = encodeURIComponent(`{Key} = "${CONTENT_KEY}"`);
  const res = await fetch(
    tableUrl(CONTENT_TABLE, `?filterByFormula=${formula}&maxRecords=1`),
    { headers: airtableHeaders() }
  );
  if (!res.ok) {
    const err = new Error(`Airtable ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  return (data.records && data.records[0]) || null;
}

export async function fetchLiveContent() {
  try {
    const rec = await fetchLiveRecord();
    if (!rec) return null;
    const raw = rec.fields['Content JSON'];
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.worlds) || !Array.isArray(parsed.disciplines)) {
      return null;
    }
    return { worlds: parsed.worlds, disciplines: parsed.disciplines };
  } catch (err) {
    console.error('[content] fetchLiveContent error:', err.message);
    return null;
  }
}

// Persist content to Airtable. Appends the prior blob to the backups table
// first (history is never lost), then upserts the live record. Backup failure
// is logged but does not block the primary save — content truth takes priority.
export async function saveLiveContent(content, adminEmail = 'admin') {
  if (
    !content ||
    !Array.isArray(content.worlds) ||
    !Array.isArray(content.disciplines)
  ) {
    return false;
  }
  const now = new Date().toISOString();
  try {
    const existing = await fetchLiveRecord();

    if (existing && existing.fields['Content JSON']) {
      await fetch(tableUrl(BACKUPS_TABLE), {
        method: 'POST',
        headers: airtableHeaders(),
        body: JSON.stringify({
          fields: {
            'Snapshot JSON': existing.fields['Content JSON'],
            'Saved At': now,
            'Saved By': adminEmail,
          },
        }),
      }).catch((err) =>
        console.error('[content] backup append failed (continuing):', err.message)
      );
    }

    const fields = {
      Key: CONTENT_KEY,
      'Content JSON': JSON.stringify(content),
      'Updated At': now,
      'Updated By': adminEmail,
    };
    const res = existing
      ? await fetch(tableUrl(CONTENT_TABLE, `/${existing.id}`), {
          method: 'PATCH',
          headers: airtableHeaders(),
          body: JSON.stringify({ fields }),
        })
      : await fetch(tableUrl(CONTENT_TABLE), {
          method: 'POST',
          headers: airtableHeaders(),
          body: JSON.stringify({ fields }),
        });

    if (!res.ok) {
      console.error(`[content] saveLiveContent failed: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[content] saveLiveContent error:', err.message);
    return false;
  }
}

// Hydrate the cache at app start. Order of preference:
//   1. Valid remote content -> apply to cache.
//   2. No remote record at all -> seed Airtable from local content (one-time).
//   3. Remote record exists but is invalid -> use local, NEVER overwrite it.
//   4. Airtable unreachable -> use local cache/seed, touch nothing.
export async function bootstrapContent() {
  const remote = await fetchLiveContent();
  if (remote) {
    applyContent(remote);
    return remote;
  }
  try {
    const rec = await fetchLiveRecord();
    if (rec && rec.fields['Content JSON']) {
      // Present but failed validation — do not clobber it.
      return getLocalContent();
    }
    // Truly absent/empty — safe to seed from local content (edits or seed).
    const local = getLocalContent();
    await saveLiveContent(local, 'seed-migration');
    return local;
  } catch {
    // Unreachable — fall back to local, leave Airtable untouched.
    return getLocalContent();
  }
}

// Admin save path: update the cache instantly, then push to Airtable truth.
// Returns true only if the Airtable write succeeded.
export async function persistContent(content, adminEmail = 'admin') {
  applyContent(content);
  return await saveLiveContent(content, adminEmail);
}
