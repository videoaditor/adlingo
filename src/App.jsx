import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { findPlayerByEmail, savePlayerProgressWithRetry, mergeProgress, flushPendingSync } from './services/airtable';
import { getStoredAuth, storeAuth, clearAuth } from './services/auth';
import { suiteEnabled, createSuiteClient } from './services/suite';
import { resolveSuiteViewer, resolveInternalViewer, isInternalViewer } from './services/viewer';
import { decideGate } from './services/gate';
import { persistCompletion } from './services/completion';
import Header from './components/Header';
import Login from './pages/Login';
import SuiteLock from './components/SuiteLock';
import WorldMap from './pages/WorldMap';
import Course from './pages/Course';
import Lesson from './pages/Lesson';
import Admin from './pages/Admin';

const SUITE_MODE = suiteEnabled();

const App = () => {
  const [user, setUser] = useState(() => getStoredAuth());
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('saved'); // 'saved' | 'syncing' | 'error'
  // Suite-consumer state. Only ever populated when SUITE_MODE is on; in internal
  // mode these stay null and every code path below is identical to before.
  const [gateDecision, setGateDecision] = useState(null);

  // Merge localStorage progress with Airtable progress — never lose data.
  // INTERNAL viewers only: suite editors never carry a Players record, so they
  // never reach this (it would be the only place a merge→Airtable write happens).
  const mergeAndStore = useCallback(async (player) => {
    const stored = getStoredAuth();
    // Only merge if localStorage has progress for the same INTERNAL user.
    if (
      isInternalViewer(player) &&
      stored &&
      isInternalViewer(stored) &&
      stored.email === player.email &&
      stored.progress
    ) {
      const merged = mergeProgress(stored.progress, player.progress);
      player = { ...player, progress: merged };
      // Sync merged result back to Airtable so both sources match.
      savePlayerProgressWithRetry(player.id, merged, setSyncStatus).catch(err => {
        console.error('Failed to sync merged progress:', err);
      });
    }
    storeAuth(player);
    setUser(player);
  }, []);

  // Flush any pending syncs from a previous session (internal Airtable queue).
  useEffect(() => {
    flushPendingSync(setSyncStatus);
  }, []);

  // --- Suite entitlement gate (suite editors only) ---------------------------
  // Runs check('adlingo') for a resolved suite editor. Allow → render curriculum;
  // deny → render the value-first lock. Fail-open handled inside the client.
  const runGate = useCallback(async (viewer) => {
    if (!SUITE_MODE || isInternalViewer(viewer) || !viewer?.jwt) {
      setGateDecision(null);
      return;
    }
    try {
      const client = createSuiteClient();
      const decision = await client.checkEntitlement(viewer.jwt, 'adlingo');
      setGateDecision(decideGate(decision));
    } catch (err) {
      console.error('[suite] gate check failed:', err);
      // Fail open on unexpected client error — never lock training on infra.
      setGateDecision({ allowed: true, reason: 'degraded_open', gate: { state: 'clear' } });
    }
  }, []);

  // Resolve identity on load:
  //   suite mode + ?token= magic link → resolve SUITE viewer (NO Players call)
  //   else email param / stored       → internal Players path (unchanged)
  useEffect(() => {
    if (user) {
      // A stored suite editor still needs a gate check on (re)load.
      if (SUITE_MODE && !isInternalViewer(user) && user.jwt) {
        runGate(user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
      return;
    }

    const params = new URLSearchParams(window.location.search);

    // SUITE PATH — magic-link redemption. External editors never touch Players.
    const tokenParam = SUITE_MODE ? params.get('token') : null;
    if (tokenParam) {
      window.history.replaceState({}, '', window.location.pathname);
      (async () => {
        try {
          const client = createSuiteClient();
          const redeemed = await client.redeemMagic(tokenParam);
          const viewer = resolveSuiteViewer(redeemed);
          if (viewer) {
            storeAuth(viewer);
            setUser(viewer);
            await runGate(viewer);
          } else {
            setLoginError('This sign-in link is invalid or expired. Request a new one.');
          }
        } catch (err) {
          console.error('[suite] magic redemption failed:', err);
          setLoginError('Sign-in failed. Request a new link.');
        }
        setLoading(false);
      })();
      return;
    }

    // INTERNAL PATH — auto-login from Hub via ?email= (byte-unchanged).
    const emailParam = params.get('email');
    if (emailParam) {
      window.history.replaceState({}, '', window.location.pathname);
      (async () => {
        try {
          const player = await findPlayerByEmail(emailParam.trim().toLowerCase());
          if (player) {
            await mergeAndStore(resolveInternalViewer(player));
          }
        } catch (err) {
          console.error('Auto-login failed:', err);
        }
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, [user, mergeAndStore, runGate]);

  // Login handler — internal email login (Players). Suite editors arrive via the
  // magic link, NOT this form, so this path never carries an external editor.
  const handleLogin = useCallback(async (email) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const player = await findPlayerByEmail(email);
      if (!player) {
        setLoginError('No editor found with this email. Contact your admin.');
        setLoginLoading(false);
        return;
      }
      await mergeAndStore(resolveInternalViewer(player));
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Connection error. Check your internet and try again.');
    }
    setLoginLoading(false);
  }, [mergeAndStore]);

  // Logout
  const handleLogout = useCallback(() => {
    clearAuth();
    setUser(null);
    setGateDecision(null);
  }, []);

  // Lesson completion handler — branches on viewer kind:
  //   readOnly viewer  → write NOWHERE (admin "view as" impersonation)
  //   suite editor     → report to the spine (training/state + metrics/ingest)
  //   internal editor  → Airtable, exactly as before
  const handleLessonComplete = useCallback(async (lessonId, score) => {
    if (!user) return;

    const progress = { ...user.progress };
    if (!progress.completedLessons) progress.completedLessons = [];
    if (!progress.scores) progress.scores = {};

    // Add to completed if not already there
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    progress.scores[lessonId] = score;

    // Calculate XP: 10 per correct answer
    progress.xp = Object.values(progress.scores).reduce((sum, s) => {
      const correct = typeof s.correct === 'number' ? s.correct : 0;
      return sum + (correct * 10);
    }, 0);

    // Update streak
    const today = new Date().toDateString();
    if (progress.lastActivity !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      progress.streak = progress.lastActivity === yesterday ? (progress.streak || 0) + 1 : 1;
      progress.lastActivity = today;
    }

    const updatedUser = { ...user, progress };
    setUser(updatedUser);

    // Read-only impersonation persists NOWHERE — no localStorage, no backend.
    // Everyone else mirrors to localStorage (as before) then routes the backend
    // write by kind. persistCompletion owns the separation + read-only invariants.
    if (!user.readOnly) {
      storeAuth(updatedUser);
    }
    const suiteClient = SUITE_MODE ? safeSuiteClient() : null;
    await persistCompletion({
      viewer: user,
      progress,
      lessonId,
      suiteMode: SUITE_MODE,
      suiteClient,
      airtableSave: savePlayerProgressWithRetry,
      onStatus: setSyncStatus,
    }).catch((err) => console.error('[adlingo] persist completion failed:', err));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} loading={loginLoading} error={loginError} suiteMode={SUITE_MODE} />;
  }

  // Suite editor denied by the spine → value-first lock instead of the curriculum.
  if (SUITE_MODE && !isInternalViewer(user) && gateDecision && !gateDecision.allowed) {
    return <SuiteLock lock={gateDecision.lock} gate={gateDecision.gate} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header user={user} onLogout={handleLogout} syncStatus={syncStatus} />
                <WorldMap user={user} />
              </>
            }
          />
          <Route
            path="/course"
            element={
              <>
                <Header user={user} onLogout={handleLogout} syncStatus={syncStatus} />
                <Course user={user} />
              </>
            }
          />
          <Route
            path="/lesson/:lessonId"
            element={<Lesson user={user} onLessonComplete={handleLessonComplete} />}
          />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

// Build a suite client without throwing when the flag is off / fetch is missing.
// Returns null on any setup failure so completion routing degrades to a no-op
// rather than crashing the lesson UX.
function safeSuiteClient() {
  try {
    return createSuiteClient();
  } catch {
    return null;
  }
}

export default App;
