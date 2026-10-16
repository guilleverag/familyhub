export type DayOfWeek = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

export const DAYS: DayOfWeek[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

export type TimeSlot = 'MAÑANA' | 'TARDE' | 'NOCHE';

export interface FamilyMember {
  id: string;
  name: string;
  color: string; // Background hex/color
  textColor: string; // Text hex/color
  isSpecial?: boolean; // True for SOLOS, FAMILIA, MIXTO
}

export interface Activity {
  id: string;
  name: string;
  slot: TimeSlot;
  order: number;
}

// Activity ID -> DayOfWeek -> Member ID (or empty string)
export type ScheduleMap = Record<string, Record<DayOfWeek, string>>;

export interface CompletionRecord {
  completed: boolean;
  completedBy: string; // Member ID who actually completed it
  completedAt?: string; // ISO date string
  notes?: string;
}

// Key format: `${yearWeek}_${activityId}_${day}` (e.g. "2026-W35_act-1_LUNES")
export type CompletionsMap = Record<string, CompletionRecord>;

export interface AppState {
  members: FamilyMember[];
  activities: Activity[];
  schedule: ScheduleMap;
  completions: CompletionsMap;
  activeWeek: string; // e.g. "2026-W35"
}

// ==========================================
// Cuentas Hogar Types
// ==========================================
export type ExpenseCategory =
  | 'Proteinas'
  | 'Vegetales'
  | 'Mercado'
  | 'Charcuteria'
  | 'Transporte'
  | 'Mascota';

export interface ExpenseCategoryConfig {
  id: ExpenseCategory;
  name: string;
  defaultBudget: number;
  color: string;
  textColor: string;
  bgLight: string;
  borderLight: string;
  badgeBg: string;
  badgeText: string;
  iconName: 'Beef' | 'Carrot' | 'ShoppingBag' | 'Ham' | 'Bus' | 'PawPrint';
}

export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  amount: number;
  dateISO: string; // "YYYY-MM-DD"
  monthKey: string; // "YYYY-MM"
  description?: string;
  createdAt: string;
}

export interface AccountsState {
  expenses: ExpenseRecord[];
  activeMonth: string; // "YYYY-MM", e.g. "2026-10"
  customBudgets?: Record<string, number>; // key: `${monthKey}_${category}` -> amount
}

export const EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  {
    id: 'Proteinas',
    name: 'Proteínas',
    defaultBudget: 250000,
    color: '#ef4444',
    textColor: '#ffffff',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    iconName: 'Beef',
  },
  {
    id: 'Vegetales',
    name: 'Vegetales',
    defaultBudget: 150000,
    color: '#10b981',
    textColor: '#ffffff',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    iconName: 'Carrot',
  },
  {
    id: 'Mercado',
    name: 'Mercado',
    defaultBudget: 1200000,
    color: '#6366f1',
    textColor: '#ffffff',
    bgLight: 'bg-indigo-50',
    borderLight: 'border-indigo-200',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    iconName: 'ShoppingBag',
  },
  {
    id: 'Charcuteria',
    name: 'Charcutería',
    defaultBudget: 120000,
    color: '#f59e0b',
    textColor: '#ffffff',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    iconName: 'Ham',
  },
  {
    id: 'Transporte',
    name: 'Transporte',
    defaultBudget: 50000,
    color: '#0284c7',
    textColor: '#ffffff',
    bgLight: 'bg-sky-50',
    borderLight: 'border-sky-200',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    iconName: 'Bus',
  },
  {
    id: 'Mascota',
    name: 'Mascota',
    defaultBudget: 90000,
    color: '#8b5cf6',
    textColor: '#ffffff',
    bgLight: 'bg-violet-50',
    borderLight: 'border-violet-200',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    iconName: 'PawPrint',
  },
];
