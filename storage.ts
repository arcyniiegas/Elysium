
import { UserState } from './types';

const STORAGE_KEY = 'elysium_v2_journey';

const INITIAL_STATE: UserState = {
  isLoggedIn: false,
  hasSeenIntro: false,
  startDate: null,
  lastSpinDate: null,
  collectedPrizes: [],
  collectedReasons: [],
  spinHistory: [],
  scheduledDates: {},
  voiceRecordings: {}
};

export const loadState = (): UserState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return INITIAL_STATE;
  try {
    const parsed = JSON.parse(saved);
    return { ...INITIAL_STATE, ...parsed };
  } catch (e) {
    return INITIAL_STATE;
  }
};

export const saveState = (state: UserState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getCurrentJourneyDay = (state: UserState): number => {
  const day = state.spinHistory.length + 1;
  return Math.min(day, 25); 
};

export const canSpinToday = (state: UserState): boolean => {
  // Total limit check
  if (state.spinHistory.length >= 25) return false;
  
  // Daily limit check
  if (!state.lastSpinDate) return true;
  
  const lastSpin = new Date(state.lastSpinDate);
  const now = new Date();
  
  // Compare local calendar dates
  const isSameDay = 
    lastSpin.getDate() === now.getDate() &&
    lastSpin.getMonth() === now.getMonth() &&
    lastSpin.getFullYear() === now.getFullYear();
    
  return !isSameDay;
};
