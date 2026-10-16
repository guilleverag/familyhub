import type { DayOfWeek } from '../types';

export const DAYS_LIST: { day: DayOfWeek; offset: number }[] = [
  { day: 'LUNES', offset: 0 },
  { day: 'MARTES', offset: 1 },
  { day: 'MIERCOLES', offset: 2 },
  { day: 'JUEVES', offset: 3 },
  { day: 'VIERNES', offset: 4 },
  { day: 'SABADO', offset: 5 },
  { day: 'DOMINGO', offset: 6 },
];

const MONTHS_SPANISH = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const MONTHS_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Returns the Monday Date object for a given date
export function getMondayOfDate(d: Date = new Date()): Date {
  const date = new Date(d);
  if (isNaN(date.getTime())) {
    return getMondayOfDate(new Date());
  }
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export const BOGOTA_TIMEZONE = 'America/Bogota';

// Returns today's date formatted as "YYYY-MM-DD" strictly in Colombia (America/Bogota) timezone
export function getBogotaTodayISO(d: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: BOGOTA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  } catch (e) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// Format Date as ISO string "YYYY-MM-DD" in Colombia (America/Bogota) timezone
export function formatDateISO(d: Date): string {
  if (!d || isNaN(d.getTime())) {
    d = new Date();
  }
  return getBogotaTodayISO(d);
}

// Safely parses "YYYY-MM-DD" string into Date object with fallback
export function parseISOToDate(isoStr: string): Date {
  if (!isoStr || typeof isoStr !== 'string') {
    return getMondayOfDate(new Date());
  }

  // Check if matches "YYYY-MM-DD"
  const parts = isoStr.split('-').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    const [y, m, d] = parts;
    const date = new Date(y, m - 1, d, 0, 0, 0, 0);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Fallback to current real Monday if invalid format or legacy week ID
  return getMondayOfDate(new Date());
}

// Get array of 7 Date objects for Monday..Sunday starting from monday
export function getWeekDates(mondayDate: Date): { day: DayOfWeek; dateISO: string; dateFormatted: string; dateObj: Date }[] {
  const validMonday = getMondayOfDate(mondayDate);

  return DAYS_LIST.map(({ day, offset }) => {
    const d = new Date(validMonday);
    d.setDate(validMonday.getDate() + offset);
    const dateISO = formatDateISO(d);
    const monthName = MONTHS_SPANISH[d.getMonth()] || 'Ene';
    const dateFormatted = `${d.getDate()} ${monthName}`;
    return {
      day,
      dateISO,
      dateFormatted,
      dateObj: d,
    };
  });
}

// Format human-readable week range e.g. "24 al 30 de Agosto de 2026"
export function formatWeekRange(mondayDate: Date): string {
  const validMonday = getMondayOfDate(mondayDate);
  const sundayDate = new Date(validMonday);
  sundayDate.setDate(validMonday.getDate() + 6);

  const startDay = validMonday.getDate();
  const startMonth = MONTHS_SPANISH[validMonday.getMonth()] || '';
  const endDay = sundayDate.getDate();
  const endMonth = MONTHS_SPANISH[sundayDate.getMonth()] || '';
  const year = sundayDate.getFullYear();

  if (validMonday.getMonth() === sundayDate.getMonth()) {
    const fullMonthName = MONTHS_FULL[validMonday.getMonth()] || '';
    return `${startDay} al ${endDay} de ${fullMonthName} ${year}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
}
