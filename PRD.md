# Product Requirements Document (PRD): "Adlingo" (formerly EditFlow Academy)

**Version:** 1.0  
**Status:** Prototype Phase  
**Objective:** Gamify Direct Response Video Editing training to standardize quality and automate performance-based compensation.

---

## 1. Executive Summary
"Adlingo" is a training platform modeled after language learning apps (Duolingo). Instead of languages, users learn Direct Response Editing principles (Retention, CTR, Pacing, CTA optimization). The app tracks performance (XP, Streaks, Accuracy) which directly dictates the editor's "Tier" and compensation rate.

## 2. Core User Stories
*   **As an Agency Owner:** I want to upload custom training modules (Hooks, Sound Design, B-Roll) so my editors learn my specific style.
*   **As an Editor:** I want to visually track my progress and understand exactly what I need to do to unlock a pay raise.
*   **As a Manager:** I want to see a leaderboard of which editors are training daily vs. those falling behind.

## 3. The "Compensation Algorithm"
The system replaces subjective performance reviews with objective data.

### Tier System (Example)
*   **Junior Editor (Tier 1):**
    *   *Requirement:* Level 1-5 completed, < 1000 XP.
    *   *Pay:* Base Rate.
*   **Retention Specialist (Tier 2):**
    *   *Requirement:* "Pacing" & "Hooks" Units completed, 90% Accuracy on Quiz.
    *   *Pay:* Base Rate + 10% Bonus per video.
*   **Direct Response Master (Tier 3):**
    *   *Requirement:* All Units completed, 7 Day Streak maintained.
    *   *Pay:* Base Rate + 20% + RevShare eligibility.

## 4. Curriculum Structure (JSON-Based)
To make design easy, the app uses a nested Data Structure:
*   **Unit:** A major topic (e.g., "The Hook", "Visual Pacing").
*   **Level:** A specific sub-skill (e.g., "Identify the Pattern Interrupt").
*   **Lesson:** A set of 5-10 interactive interactions.

### Interaction Types
*   **Theory Check:** Multiple choice questions on concepts.
*   **Clip Analysis:** (Prototype simulates this) "Which clip has better pacing?"
*   **Sequencing:** Drag and drop blocks to form a correct narrative arc.
*   **Spot the Error:** Identify why a specific frame ruins retention.

## 5. Technical Requirements
*   **Frontend:** React, Tailwind CSS (for rapid UI iteration).
*   **State Management:** Local Storage (Prototype) -> Firestore (Production).
*   **Media:** Lightweight video embeds or GIFs for visual questions.

## 6. Future Roadmap (Post-Prototype)
*   **Video Upload Assignments:** Editors upload a real edit, Admin grades it, and the grade converts to XP.
*   **Slack Integration:** Auto-post "New High Score" to the company Slack channel.
*   **Shop:** Spend "Gems" earned from lessons to buy assets (LUTs, SFX Packs) provided by the agency.

