// Simple abstraction to switch between LocalStorage and Firebase later
// For now, we default to LocalStorage for immediate "runnability"

const STORAGE_KEY = 'adlingo_user_v1';

const defaultUser = {
  xp: 45,
  streak: 3,
  hearts: 5,
  gems: 120,
  completedLevels: [],
  currentRankIndex: 0,
  uid: 'guest'
};

export const getUserData = async () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : defaultUser;
};

export const saveUserData = async (userData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  // In Phase 2: Sync to Firebase here
};

