// Pure completion-routing — decides WHERE a lesson completion is persisted, so
// the separation + read-only invariants are unit-testable without React/DOM.
//
// Routing rules (mirrors App.handleLessonComplete):
//   readOnly viewer  → write NOWHERE (admin "view as" impersonation).
//   suite editor     → report to the spine (reportTraining: training/state + ingest).
//   internal editor  → Airtable (savePlayerProgressWithRetry).
//
// Dependencies are injected (suiteClient, airtableSave) so a test can spy on both
// and assert that an external/readOnly viewer triggers ZERO Airtable calls.
import { isInternalViewer, isReadOnly } from './viewer.js';

export async function persistCompletion({
  viewer,
  progress,
  lessonId,
  suiteMode,
  suiteClient, // { reportTraining(jwt, payload) }
  airtableSave, // savePlayerProgressWithRetry(recordId, progress, onStatus)
  onStatus,
  now = () => new Date().toISOString(),
}) {
  if (!viewer) return { target: 'none' };

  // READ-ONLY impersonation → persist nothing, anywhere.
  if (isReadOnly(viewer)) {
    return { target: 'none', reason: 'read_only' };
  }

  // SUITE editor → spine only. Never Airtable.
  if (suiteMode && !isInternalViewer(viewer) && viewer.jwt) {
    if (suiteClient && typeof suiteClient.reportTraining === 'function') {
      await suiteClient.reportTraining(viewer.jwt, {
        trainingId: lessonId,
        completedAt: now(),
        seatId: viewer.seatId,
        completionPct: (progress?.completedLessons || []).length,
      });
    }
    return { target: 'spine' };
  }

  // INTERNAL editor → Airtable with retry (unchanged behavior).
  if (isInternalViewer(viewer) && viewer.id && typeof airtableSave === 'function') {
    airtableSave(viewer.id, progress, onStatus);
    return { target: 'airtable' };
  }

  return { target: 'none' };
}
