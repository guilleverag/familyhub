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
