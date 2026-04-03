import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { findPlayerByEmail, savePlayerProgress } from './services/airtable';
import { getStoredAuth, storeAuth, clearAuth } from './services/auth';
import Header from './components/Header';
import Login from './pages/Login';
import WorldMap from './pages/WorldMap';
import Course from './pages/Course';
import Lesson from './pages/Lesson';
import Admin from './pages/Admin';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Check stored auth on mount — also handle auto-login from Hub via URL param
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setUser(stored);
      setLoading(false);
      return;
    }

    // Auto-login: check for ?email= param (passed from Editor Hub)
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      // Clean up the URL (remove ?email= so it doesn't linger)
      window.history.replaceState({}, '', window.location.pathname);
      // Auto-login with the email
      (async () => {
        try {
          const player = await findPlayerByEmail(emailParam.trim().toLowerCase());
          if (player) {
            storeAuth(player);
            setUser(player);
          }
        } catch (err) {
          console.error('Auto-login failed:', err);
        }
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, []);

  // Login handler
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
      storeAuth(player);
      setUser(player);
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Connection error. Check your internet and try again.');
    }
    setLoginLoading(false);
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  // Lesson completion handler — update progress and sync to Airtable
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
    storeAuth(updatedUser);

    // Sync to Airtable (fire and forget)
    if (user.id) {
      savePlayerProgress(user.id, progress).catch(console.error);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} loading={loginLoading} error={loginError} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header user={user} onLogout={handleLogout} />
                <WorldMap user={user} />
              </>
            }
          />
          <Route
            path="/course"
            element={
              <>
                <Header user={user} onLogout={handleLogout} />
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

export default App;
