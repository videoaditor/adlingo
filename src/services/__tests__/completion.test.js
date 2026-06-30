import { describe, it, expect, vi } from 'vitest';
import { Buffer } from 'node:buffer';
import { persistCompletion } from '../completion.js';
import { resolveSuiteViewer, resolveInternalViewer } from '../viewer.js';
import * as airtable from '../airtable.js';

function makeJwt(payload) {
  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.sig`;
}

const progress = { completedLessons: ['l1'], scores: {}, xp: 10 };

describe('persistCompletion — internal editor → Airtable', () => {
  it('routes an internal editor to the Airtable save path', async () => {
    const airtableSave = vi.fn();
    const suiteClient = { reportTraining: vi.fn() };
    const viewer = resolveInternalViewer({ id: 'recA', email: 's@aditor.ai' });

    const out = await persistCompletion({
      viewer, progress, lessonId: 'l1', suiteMode: false, suiteClient, airtableSave,
    });

    expect(out.target).toBe('airtable');
    expect(airtableSave).toHaveBeenCalledWith('recA', progress, undefined);
    expect(suiteClient.reportTraining).not.toHaveBeenCalled();
  });
});

describe('persistCompletion — suite editor → spine only (separation on WRITE)', () => {
  it('reports to the spine and writes NOTHING to Airtable', async () => {
    const saveSpy = vi.spyOn(airtable, 'savePlayerProgress');
    const saveRetrySpy = vi.spyOn(airtable, 'savePlayerProgressWithRetry');
    const airtableSave = vi.fn(); // also pass the real signature as the injected fn
    const reportTraining = vi.fn().mockResolvedValue({ ok: true });
    const suiteClient = { reportTraining };

    const jwt = makeJwt({ sub: 'seat_ext', email: 'freelancer@brand.com' });
    const viewer = resolveSuiteViewer({ ok: true, token: jwt });

    const out = await persistCompletion({
      viewer, progress, lessonId: 'l1', suiteMode: true, suiteClient, airtableSave,
    });

    expect(out.target).toBe('spine');
    // Spine got the completion…
    expect(reportTraining).toHaveBeenCalledTimes(1);
    expect(reportTraining.mock.calls[0][0]).toBe(jwt);
    expect(reportTraining.mock.calls[0][1]).toMatchObject({ trainingId: 'l1', seatId: 'seat_ext' });
    // …and Airtable got NOTHING (zero calls, via both the injected fn and the module).
    expect(airtableSave).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(saveRetrySpy).not.toHaveBeenCalled();
  });
});

describe('persistCompletion — readOnly token blocks ALL writes', () => {
  it('a read-only suite editor writes nowhere (no spine, no Airtable)', async () => {
    const airtableSave = vi.fn();
    const reportTraining = vi.fn();
    const suiteClient = { reportTraining };

    const jwt = makeJwt({ sub: 'seat_admin', email: 'admin@aditor.ai', readOnly: true });
    const viewer = resolveSuiteViewer({ ok: true, token: jwt });
    expect(viewer.readOnly).toBe(true);

    const out = await persistCompletion({
      viewer, progress, lessonId: 'l1', suiteMode: true, suiteClient, airtableSave,
    });

    expect(out.target).toBe('none');
    expect(out.reason).toBe('read_only');
    expect(reportTraining).not.toHaveBeenCalled();
    expect(airtableSave).not.toHaveBeenCalled();
  });

  it('a read-only INTERNAL viewer also writes nowhere', async () => {
    const airtableSave = vi.fn();
    const viewer = { ...resolveInternalViewer({ id: 'recA', email: 's@aditor.ai' }), readOnly: true };
    const out = await persistCompletion({
      viewer, progress, lessonId: 'l1', suiteMode: false, suiteClient: null, airtableSave,
    });
    expect(out.target).toBe('none');
    expect(airtableSave).not.toHaveBeenCalled();
  });
});
