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
