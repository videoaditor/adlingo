import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// THE separation invariant (Alan: "crucial fuck-up to avoid at all costs"):
// an external / suite editor must NEVER reach the internal Players table or
// dispatch. The suite/external code path runs ONLY through these modules — none
// of them may import the Players service (airtable.js) or hardcode the Players
// table id. Asserted by source inspection so it fails the moment someone wires a
// BrandEditor read/write through the Players path. App.jsx may touch both (it is
// the orchestrator), but it is gated by isInternalViewer — covered in
// completion.test.js (an external viewer triggers ZERO airtable calls).
const servicesDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXTERNAL_PATH_MODULES = ['suite.js', 'viewer.js', 'gate.js', 'completion.js', 'ownerClient.js', 'seatCap.js'];
const PLAYERS_TABLE_ID = 'tblJ2RgdTVX5zdgTc';
const importsAirtable = (src) => /\bfrom\s+['"][^'"]*airtable/.test(src);

describe('separation invariant — the suite/external path never reaches Players', () => {
  for (const mod of EXTERNAL_PATH_MODULES) {
    const src = readFileSync(join(servicesDir, mod), 'utf8');

    it(`${mod} imports nothing from the Players service (airtable.js)`, () => {
      expect(importsAirtable(src), `${mod} must not import airtable.js`).toBe(false);
    });

    it(`${mod} does not hardcode the Players table id`, () => {
      expect(src.includes(PLAYERS_TABLE_ID), `${mod} must not reference the Players table`).toBe(false);
    });
  }
});

describe('separation invariant — the owner dashboard never reaches Players', () => {
  const dashboard = readFileSync(join(servicesDir, '..', 'pages', 'OwnerDashboard.jsx'), 'utf8');
  it('OwnerDashboard.jsx imports nothing from the Players service (airtable.js)', () => {
    expect(importsAirtable(dashboard), 'OwnerDashboard must not import airtable.js').toBe(false);
  });
  it('OwnerDashboard.jsx does not hardcode the Players table id', () => {
    expect(dashboard.includes(PLAYERS_TABLE_ID), 'OwnerDashboard must not reference the Players table').toBe(false);
  });
});
