<!-- abnahme
repo: /Users/alansimon/Desktop/adlingo/adlingo
branch: nacht/2026-06-24-adlingo-foundation-t0-t1core
base: main
area: AdLingo (Editor-Suite pivot)
title: AdLingo P1 Foundation — audience-aware curriculum core + test runner
status: verifiziert
preview: none
preview_url: 
verify: npm test && npm run lint && npm run build
-->

# AdLingo P1 Foundation — audience-aware curriculum core + test runner

## Was & Warum

Dieser Increment legt das Fundament für den Editor-Suite-Pivot: ein Test-Runner
(vitest) und das **audience-aware Curriculum** als reine, getestete Funktion —
ohne ein einziges Byte Produktionsverhalten zu ändern. Worlds tragen jetzt zwei
additive Felder (`audience`, default `'universal'`; `countsTowardStage`, default
`true`), und `getCurriculumForAudience()` kann `internal`-Worlds für externe
Viewer ausblenden **und dabei die Unlock-Kette neu verknüpfen**, damit ein
entfernter Mittel-World keinen „dangling" `unlockAfterWorld` hinterlässt (den
`isWorldUnlocked` heute als „freigeschaltet" liest und so das ganze Curriculum
für Externe öffnen würde). Zusätzlich zählt der Fortschritts-Nenner künftige
„coming soon"-Platzhalter-Lektionen nicht mehr mit. Da heute noch kein
`internal`-World existiert, ist die interne (Produktions-)Sicht **byte-identisch**.

## Verifiziert durch

Befehle aus dem Repo-Root, echte Ergebnisse:

- **`npm test`** → **grün: 16 passed (16)**, 3 Test-Dateien
  - `src/__tests__/smoke.test.js` — 1 Test (T0)
  - `src/data/__tests__/curriculum.test.js` — 9 Tests (T1-core: Non-Disruption + Mechanismus)
  - `src/data/__tests__/denominator.test.js` — 6 Tests (T1b: Platzhalter-Predikat + Nenner)
- **`npm run build`** → **erfolgreich** (`vite build`, 2103 modules transformed, exit 0).
  Hinweis: Der JS-Bundle-Hash (`index-lgvM3shc.js`, 489.59 kB) ist **identisch** zum
  Build vor T1b — konsistent mit byte-identischem Laufzeitverhalten (die neuen
  Exports werden mangels Importeur aus dem Prod-Bundle ge-tree-shaked).
- **`npm run lint`** → **rot, ABER pre-existing & NICHT von mir verursacht.**
  - Baseline auf `main` (vor meinen Änderungen): `28 problems (24 errors, 4 warnings)`.
  - Baseline auf diesem Branch (mit meinen Änderungen): `28 problems (24 errors, 4 warnings)`
    — **exakt gleiche Zahl, exakt dieselben 12 Dateien** (`App.jsx`, `Admin.jsx`,
    `Course.jsx`, `QuizEngine.jsx`, `ConfettiBurst.jsx`, `Header.jsx`, `Login.jsx`,
    `Lesson.jsx`, `WorldMap.jsx`, `AditorLogo.jsx`, `CaughtUpBanner.jsx`,
    `WorldClearCelebration.jsx`).
  - **Keine** meiner Dateien (`courseData.js`, `vitest.config.js`, die drei
    Test-Dateien, `package.json`) taucht im Lint-Output auf. Gezielter Lauf
    `eslint` auf genau diese Dateien → **exit 0, clean**.
  - Fazit: `eslint .` ist im Repo schon auf `main` rot; mein Beitrag fügt **0 neue
    Violations** hinzu. Ich melde das ehrlich statt „lint passed" zu behaupten.
    (Der pre-existing Lint-Debt ist ein separater Aufräum-Task — bewusst nicht
    Teil dieses non-disruptiven Increments.)

## So probierst du es aus

```sh
cd /Users/alansimon/Desktop/adlingo/adlingo
git checkout nacht/2026-06-24-adlingo-foundation-t0-t1core
npm test
```

Erwartung: `16 passed (16)`. `npm run build` läuft ebenfalls grün. `npm run lint`
ist rot — siehe oben (pre-existing, nicht durch diesen Increment).

### Commits (3, lokal — NICHT gepusht)

1. `test(T0): add vitest runner + smoke test`
2. `feat(T1-core): audience-aware curriculum filter (additive, fixture-tested)`
3. `fix(T1b): exclude content-less world lessons from progress denominator`

### Was genau drin ist

- **T0** — `package.json`: `"test": "vitest run"` + `"test:watch": "vitest"`,
  `vitest ^2.1.9` als devDep (gepinnt auf die installierte Version, **kein**
  Reinstall). `vitest.config.js` (node env). `src/__tests__/smoke.test.js`.
- **T1-core** — `src/data/courseData.js`: additive Felder `audience` /
  `countsTowardStage` an allen 4 Seed-Worlds (alle `'universal'`/`true` → Bedeutung
  unverändert); reine `getCurriculumForAudience(audience, { worlds })`;
  `SEED_WORLDS` additiv exportiert (für deterministische Tests ohne `localStorage`);
  `CURRENT_SEED_VERSION` 4 → 5. Tests beweisen (a) Non-Disruption mit echten Seeds
  (ID-Set **und** `unlockAfterWorld` byte-identisch für `'universal'` **und**
  `'internal'`) und (b) Mechanismus über eine Fixture mit einem Mittel-`internal`-
  World: `'universal'` droppt ihn und re-linkt `d`→`b` (kein Survivor zeigt auf
  einen gedroppten World); `'internal'` behält ihn.
- **T1b** — `src/data/courseData.js`: `getAllLessonIds()` filtert World-Lektionen
  durch `lessonHasContent()` (videoUrl ODER nicht-leere questions). Vorbedingung
  **verifiziert**: alle 15 aktuellen World-Lektionen haben ein `videoUrl` (0 ohne)
  → verhaltenswahrend. Tests decken Predikat + realen w1–w4-Nenner ab.

## Bewusst verschoben / Geschmacksfragen an Alan

1. **Der echte Home-Base-World-Seed (l16/l17/l18) wurde NICHT gebaut — verschoben.**
   Grund: Die Spec widerspricht sich intern. **Grenzen Zeile 36** sagt für diese
   Phase ausdrücklich *„here we only add the field + a fixture"*, während **T1
   Zeile 66** *„Seed the real Home Base world at order 3"* (mit l16/l17/l18 und
   Reorder Working Faster→4, Ad Anatomy→5) verlangt. Den echten World zu seeden
   **würde das sichtbare Curriculum interner Nutzer verändern** (neue World, neue
   Reihenfolge) — das verletzt die Non-Disruption-Regel und den expliziten
   „behavior-unchanged"-Goal (Stop & Eskalation: „A change would alter current
   internal output"). Ich habe deshalb die contradiction-freie Scheibe gebaut:
   Audience-Modell + Filter + Nenner-Fix, ohne Content-Seed. **Bitte bestätigen,
   welche Lesart gilt**, bevor der nächste Lauf Home Base seedet.

2. **Wording-Widerspruch Done-Zeile-115 vs. T1-Zeile-70.** Die `Done`-Sektion
   (Z. 115) sagt, `getCurriculumForAudience('internal', …)` solle deep-equal zum
   pre-change `getWorlds()`-Set sein; T1 (Z. 70) sagt, **`'universal'`** solle dem
   heutigen Set entsprechen. Heute sind beide wahr (kein `internal`-World existiert),
   also sind meine Tests gegen **beide** Audiences grün. Sobald aber Home Base als
   `internal` dazukommt, divergieren die Aussagen: dann ist **nur `'universal'`**
   == heutiges externes Set, während `'internal'` Home Base *zusätzlich* enthält.
   **Empfehlung:** Die Spec sollte an der relevanten Stelle `'universal'` sagen
   (das ist die externe Sicht, die „heutiges Set" meint). Bitte gegenchecken.

3. **Übrige P1-Tasks heute NICHT gebaut** (außerhalb dieser Scheibe, für spätere
   Läufe):
   - **T2 — Viewer-Resolver** (`src/services/viewer.js`, `resolveViewer`).
   - **T3 — External Store Contract + In-Memory-Fake** (`src/services/externalStore.js`,
     Brands/BrandEditors/invites; Tabellen-IDs **distinct von** `Players`).
   - **T4 — Whop-Logik (pure)** (`server/whop/entitlement.js`,
     `decideEntitlement` / `mapWebhookToStatus`, gemockt, keine Routes).
   - **T5 — Separation-Invariant-Tripwire** (Test: externe Module referenzieren
     nie die `Players`-Tabelle / importieren nie `getAllPlayers`).
   - **T6 — Hub-Sync-Notiz** (`docs/HUB_INTEGRATION.md`: neuer World ist
     `countsTowardStage:false`, aus `ADLINGO_WORLDS` Stage-Math ausschließen).
     Hinweis: Das Feld `countsTowardStage` ist mit T1-core bereits im World-Shape
     vorhanden (default `true`), sodass T6 nur noch dokumentiert werden muss, sobald
     der echte (internal) Home-Base-World existiert.

4. **Lint-Debt (pre-existing).** `eslint .` ist im Repo bereits auf `main` rot
   (24 Errors, v. a. `react-hooks/set-state-in-effect`, `purity` in `ConfettiBurst`,
   ungenutzte `motion`-Imports). Nicht Teil dieses Increments — wäre ein eigener,
   klar abgegrenzter Aufräum-PR. Bitte sag, ob du den separat willst.
