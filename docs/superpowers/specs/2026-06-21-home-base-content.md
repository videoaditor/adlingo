# Home Base — World 3 content   (internal-only)

> Curriculum content for the new internal world (`audience:'internal'`, `countsTowardStage:false`,
> order 3). Drafted by Claude from the Tella transcripts on 2026-06-21; **awaiting Alan's taste
> review** before it's seeded into [src/data/courseData.js](../../../src/data/courseData.js).
> Quizzes follow the existing house style: one `question`, four `options` (exactly one `correct`),
> a `directorNote` shown after answering. IDs chosen to avoid collisions (`l16–l18`, `q-hb*`).

World shape (seed):
```
{ id: 'w5', name: 'Home Base', subtitle: 'HOW WE WORK TOGETHER',
  audience: 'internal', countsTowardStage: false, order: 3,
  themeColor: 'from-emerald-600 to-green-500', /* green = "you're home / we've got you" */
  description: "Your home base at Aditor — get set up, get projects, get paid.",
  unlockAfterWorld: 'w2', lessons: [l16, l17, l18] }
```
> Inserting at order 3 shifts **Working Faster** → order 4 and **Ad Anatomy** → order 5, and the
> internal unlock chain becomes w1 → w2 → **w5 (Home Base)** → w3 (Working Faster) → w4 (Ad Anatomy).
> For the **external** audience Home Base is filtered out and the chain is re-linked w2 → w3 (see
> Phase 1 T1).

---

## Lesson l16 — How to log into the shared mail (player@aditor.ai)
- `videoUrl`: `https://www.tella.tv/video/how-to-log-into-playeraditorai-3whj` · `videoType: 'tella'`
- `subtitle`: "Get past 2FA on the shared account — by yourself"
- Short, easy video → **3 questions** only.

**q-hb1-1** — When the shared Google login asks for a 2FA code, what's the move?
- ✅ Click "try another way" and choose "Get a verification code from the Google Authenticator app"
- Message an admin and wait for them to send you the code
- Use the "text a code to the recovery phone" option
- Close the tab and reopen it to skip the 2FA step
- *directorNote:* Don't wait on anyone — click **"try another way"** and pick **"Get a verification code from the Google Authenticator app."** A relay (set up by Shawn) pipes that code into your own Bitwarden vault so you can read it yourself.

**q-hb1-2** — Where do you read the current verification code?
- ✅ Your self-hosted Bitwarden vault at vault.aditor.ai, under the player Google login
- The Notion onboarding page
- A shared Google Sheet of login codes
- The team Slack channel
- *directorNote:* Log into your **Bitwarden** account (self-hosted on **vault.aditor.ai**), open the player Google login entry, and copy the code. Browser or the phone app both work — the phone's more convenient. The code is time-based, so grab it **just before it refreshes**.

**q-hb1-3** — You're not in Bitwarden yet. Who do you ask?
- ✅ Shawn
- Alan
- Tim
- Patryk
- *directorNote:* **Shawn** handles all the technical setup — he can add you to Bitwarden. Ping him and you'll be self-serving your codes in no time.

---

## Lesson l17 — How to get projects (the dispatcher)  ·  with Tim
- `videoUrl`: `https://www.tella.tv/video/dispatcher-1-cxn3` · `videoType: 'tella'`
- `subtitle`: "How the dispatch agent sends you cards — and the trust battery"

**q-hb2-1** — A card is dispatched to you. How long do you have to accept or decline before it's reassigned?
- ✅ 30 minutes
- 10 minutes
- 24 hours
- Until the end of the day
- *directorNote:* You get **30 minutes** to respond. Ignore it and the dispatcher cancels it for you and sends it to the next best editor — so respond fast, even if it's a decline.

**q-hb2-2** — What happens the moment you accept a dispatched card?
- ✅ It's labeled with your name, moved to Active, and given its due date — you can start working
- It stays in Next Up until an admin assigns it manually
- You have to add your own label and deadline in Trello yourself
- It's sent to a second editor to confirm first
- *directorNote:* On accept, the system sets your label, sets the due date, and moves the card to **Active**. If any of that doesn't happen, report it so we can fix it.

**q-hb2-3** — Who does the dispatcher offer a new card to first?
- ✅ The most trustworthy editors with the best track record (highest trust battery)
- The editors who've been on the team the longest
- The newest editors, to help them get started
- Whoever happens to be online and grabs it first
- *directorNote:* Cards go first to the editors with the **highest trust battery — earned by a track record of reliable delivery**, not by seniority or being new. (75–100 = first in line; 50–74 = watch list, fewer cards; suspended = no cards.)

**q-hb2-4** — Which action gains you the MOST trust-battery points?
- ✅ Delivering on time and getting approved without revisions (+3)
- Accepting a card within 10 minutes (+2)
- Accepting a dispatched card (+1)
- Declining a card you can't take
- *directorNote:* The biggest gain is a **clean delivery — on time and approved without a revision round (+3)**. Fast accept (≤10 min) is +2, accepting is +1; **ignoring** a dispatch is −1 and **late** delivery is −3. Declining is **not** penalized — better to decline than ghost the dispatcher.

---

## Lesson l18 — How to bill your work (autobilling)   ·   COMING SOON
- `videoUrl: null`, `videoType: null`, `questions: []`  → placeholder; excluded from the progress
  denominator by the Phase 1 T1b fix. Swap in the video + quiz when Alan provides it.
