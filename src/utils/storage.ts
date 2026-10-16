import type { AppState, AccountsState } from '../types';
import { INITIAL_MEMBERS, INITIAL_ACTIVITIES, INITIAL_SCHEDULE } from '../data/initialData';
import { getMondayOfDate, formatDateISO } from './dates';
import { getMonthKey } from './accounts';

const STORAGE_KEY = 'familyhub_state_v2';
const STORAGE_KEY_ACCOUNTS = 'familyhub_accounts_v1';

export function getInitialState(): AppState {
  const currentMondayISO = formatDateISO(getMondayOfDate(new Date()));

  if (typeof window === 'undefined') {
    return {
      members: INITIAL_MEMBERS,
      activities: INITIAL_ACTIVITIES,
      schedule: INITIAL_SCHEDULE,
      completions: {},
      activeWeek: currentMondayISO,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state: AppState = {
        members: INITIAL_MEMBERS,
        activities: INITIAL_ACTIVITIES,
        schedule: INITIAL_SCHEDULE,
        completions: {},
        activeWeek: currentMondayISO,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }
    const parsed = JSON.parse(raw);

    // Validate activeWeek format (must be YYYY-MM-DD)
    let validActiveWeek = currentMondayISO;
    if (parsed.activeWeek && typeof parsed.activeWeek === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.activeWeek)) {
      validActiveWeek = parsed.activeWeek;
    }

    return {
      members: parsed.members || INITIAL_MEMBERS,
      activities: parsed.activities || INITIAL_ACTIVITIES,
      schedule: parsed.schedule || INITIAL_SCHEDULE,
      completions: parsed.completions || {},
      activeWeek: validActiveWeek,
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return {
      members: INITIAL_MEMBERS,
      activities: INITIAL_ACTIVITIES,
      schedule: INITIAL_SCHEDULE,
      completions: {},
      activeWeek: currentMondayISO,
    };
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function resetToDefaults(): AppState {
  const currentMondayISO = formatDateISO(getMondayOfDate(new Date()));
  const state: AppState = {
    members: INITIAL_MEMBERS,
    activities: INITIAL_ACTIVITIES,
    schedule: INITIAL_SCHEDULE,
    completions: {},
    activeWeek: currentMondayISO,
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
}

export function getCurrentWeekId(): string {
  return formatDateISO(getMondayOfDate(new Date()));
}

// ==========================================
// Cuentas Hogar Storage
// ==========================================
export function getInitialAccountsState(): AccountsState {
  const currentMonthKey = getMonthKey(new Date());

  if (typeof window === 'undefined') {
    return {
      expenses: [],
      activeMonth: currentMonthKey,
      customBudgets: {},
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      const state: AccountsState = {
        expenses: [],
        activeMonth: currentMonthKey,
        customBudgets: {},
      };
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(state));
      return state;
    }
    const parsed = JSON.parse(raw);
    return {
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      activeMonth: parsed.activeMonth && /^\d{4}-\d{2}$/.test(parsed.activeMonth)
        ? parsed.activeMonth
        : currentMonthKey,
      customBudgets: parsed.customBudgets || {},
    };
  } catch (err) {
    console.error('Error loading accounts state from localStorage:', err);
    return {
      expenses: [],
      activeMonth: currentMonthKey,
      customBudgets: {},
    };
  }
}

export function saveAccountsState(state: AccountsState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving accounts state to localStorage:', err);
  }
}
