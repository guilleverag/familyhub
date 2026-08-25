import type { FamilyMember, Activity, ScheduleMap, DayOfWeek } from '../types';

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'mem-dani',
    name: 'DANI',
    color: '#4ade80', // Emerald Green (Vibrant, fresh)
    textColor: '#052e16',
    isSpecial: false,
  },
  {
    id: 'mem-guille',
    name: 'GUILLE',
    color: '#60a5fa', // Vivid Blue
    textColor: '#1e3a8a',
    isSpecial: false,
  },
  {
    id: 'mem-santiago',
    name: 'SANTIAGO',
    color: '#f87171', // Clean Coral Red
    textColor: '#450a0a',
    isSpecial: false,
  },
  {
    id: 'mem-mathias',
    name: 'MATHIAS',
    color: '#c084fc', // Vivid Violet
    textColor: '#3b0764',
    isSpecial: false,
  },
  {
    id: 'mem-mixto',
    name: 'MIXTO',
    color: '#facc15', // Warm Gold/Yellow
    textColor: '#422006',
    isSpecial: true,
  },
  {
    id: 'mem-solos',
    name: 'SOLOS',
    color: '#fb923c', // Clean Orange
    textColor: '#431407',
    isSpecial: true,
  },
  {
    id: 'mem-familia',
    name: 'FAMILIA',
    color: '#f472b6', // Clean Rose Pink
    textColor: '#500724',
    isSpecial: true,
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  // MAÑANA
  { id: 'act-1', name: 'COLEGIO SANTIAGO (ENTRADA)', slot: 'MAÑANA', order: 1 },
  { id: 'act-2', name: 'COLEGIO MATHIAS (ENTRADA)', slot: 'MAÑANA', order: 2 },
  { id: 'act-3', name: 'TENDER CAMAS', slot: 'MAÑANA', order: 3 },
  { id: 'act-4', name: 'SACAR MAX MAÑANA', slot: 'MAÑANA', order: 4 },
  { id: 'act-5', name: 'COCINAR DESAYUNO', slot: 'MAÑANA', order: 5 },
  { id: 'act-6', name: 'LAVAR PLATOS DESAYUNO', slot: 'MAÑANA', order: 6 },
  { id: 'act-7', name: 'GUARDAR PLATOS DESAYUNO', slot: 'MAÑANA', order: 7 },
  { id: 'act-8', name: 'LIMPIAR MESA', slot: 'MAÑANA', order: 8 },

  // TARDE
  { id: 'act-9', name: 'COMIDA MAX SOPA', slot: 'TARDE', order: 9 },
  { id: 'act-10', name: 'COCINAR ALMUERZO', slot: 'TARDE', order: 10 },
  { id: 'act-11', name: 'LAVAR PLATOS ALMUERZO', slot: 'TARDE', order: 11 },
  { id: 'act-12', name: 'GUARDAR PLATOS ALMUERZO', slot: 'TARDE', order: 12 },
  { id: 'act-13', name: 'LIMPIAR COCINA GAS', slot: 'TARDE', order: 13 },
  { id: 'act-14', name: 'LIMPIAR MESA', slot: 'TARDE', order: 14 },
  { id: 'act-15', name: 'COLEGIO MATHIAS (SALIDA)', slot: 'TARDE', order: 15 },
  { id: 'act-16', name: 'BAÑAR BEBE', slot: 'TARDE', order: 16 },
  { id: 'act-17', name: 'TAREAS SANTI', slot: 'TARDE', order: 17 },
  { id: 'act-18', name: 'TIEMPO CALIDAD MATHI', slot: 'TARDE', order: 18 },
  { id: 'act-19', name: 'TIEMPO CALIDAD SANTI', slot: 'TARDE', order: 19 },

  // NOCHE
  { id: 'act-20', name: 'COCINAR CENA', slot: 'NOCHE', order: 20 },
  { id: 'act-21', name: 'LAVAR PLATOS CENA', slot: 'NOCHE', order: 21 },
  { id: 'act-22', name: 'GUARDAR PLATOS CENA', slot: 'NOCHE', order: 22 },
  { id: 'act-23', name: 'SACAR MAX NOCHE', slot: 'NOCHE', order: 23 },
  { id: 'act-24', name: 'DORMIR BEBE', slot: 'NOCHE', order: 24 },
  { id: 'act-25', name: 'ORDENAR SALA', slot: 'NOCHE', order: 25 },
  { id: 'act-26', name: 'LIMPIAR BAÑOS', slot: 'NOCHE', order: 26 },
  { id: 'act-27', name: 'LIMPIAR DUCHAS', slot: 'NOCHE', order: 27 },
  { id: 'act-28', name: 'BARRER LA CASA', slot: 'NOCHE', order: 28 },
  { id: 'act-29', name: 'COLETO LA CASA', slot: 'NOCHE', order: 29 },
  { id: 'act-30', name: 'BOTAR BASURA', slot: 'NOCHE', order: 30 },
  { id: 'act-31', name: 'LAVAR ROPA', slot: 'NOCHE', order: 31 },
  { id: 'act-32', name: 'TENDER ROPA', slot: 'NOCHE', order: 32 },
  { id: 'act-33', name: 'GUARDAR ROPA', slot: 'NOCHE', order: 33 },
];

const emptyDays = (): Record<DayOfWeek, string> => ({
  LUNES: '',
  MARTES: '',
  MIERCOLES: '',
  JUEVES: '',
  VIERNES: '',
  SABADO: '',
  DOMINGO: '',
});

export const INITIAL_SCHEDULE: ScheduleMap = {
  'act-1': { ...emptyDays(), LUNES: 'mem-dani', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-guille', VIERNES: 'mem-dani' },
  'act-2': { ...emptyDays(), LUNES: 'mem-dani', MARTES: 'mem-guille', MIERCOLES: 'mem-guille', JUEVES: 'mem-guille', VIERNES: 'mem-dani' },
  'act-3': { ...emptyDays(), LUNES: 'mem-dani', MARTES: 'mem-dani', MIERCOLES: 'mem-dani', JUEVES: 'mem-dani', VIERNES: 'mem-dani', SABADO: 'mem-mixto', DOMINGO: 'mem-mixto' },
  'act-4': { ...emptyDays(), LUNES: 'mem-dani', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-guille', VIERNES: 'mem-dani', SABADO: 'mem-guille', DOMINGO: 'mem-guille' },
  'act-5': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-dani', VIERNES: 'mem-guille' },
  'act-6': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-dani', VIERNES: 'mem-guille' },
  'act-7': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-dani', VIERNES: 'mem-guille' },
  'act-8': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-dani', VIERNES: 'mem-guille', SABADO: 'mem-santiago', DOMINGO: 'mem-santiago' },

  'act-9': emptyDays(),
  'act-10': { ...emptyDays(), LUNES: 'mem-dani', MARTES: 'mem-guille', MIERCOLES: 'mem-dani', JUEVES: 'mem-guille', VIERNES: 'mem-dani' },
  'act-11': { ...emptyDays(), LUNES: 'mem-dani', MARTES: 'mem-guille', MIERCOLES: 'mem-dani', JUEVES: 'mem-guille', VIERNES: 'mem-dani' },
  'act-12': { ...emptyDays(), LUNES: 'mem-dani', MARTES: 'mem-guille', MIERCOLES: 'mem-dani', JUEVES: 'mem-guille', VIERNES: 'mem-dani' },
  'act-13': { ...emptyDays(), LUNES: 'mem-dani', MARTES: 'mem-guille', MIERCOLES: 'mem-dani', JUEVES: 'mem-guille', VIERNES: 'mem-dani' },
  'act-14': { ...emptyDays(), LUNES: 'mem-santiago', MARTES: 'mem-santiago', MIERCOLES: 'mem-santiago', JUEVES: 'mem-santiago', VIERNES: 'mem-santiago', SABADO: 'mem-santiago', DOMINGO: 'mem-santiago' },
  'act-15': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-dani', MIERCOLES: 'mem-dani', JUEVES: 'mem-dani', VIERNES: 'mem-guille' },
  'act-16': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-dani', MIERCOLES: 'mem-dani', JUEVES: 'mem-guille' },
  'act-17': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-dani' },
  'act-18': { ...emptyDays(), LUNES: 'mem-solos', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-solos', VIERNES: 'mem-familia', SABADO: 'mem-solos', DOMINGO: 'mem-familia' },
  'act-19': { ...emptyDays(), LUNES: 'mem-solos', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-solos', VIERNES: 'mem-familia', SABADO: 'mem-solos', DOMINGO: 'mem-familia' },

  'act-20': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-dani', VIERNES: 'mem-guille' },
  'act-21': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-dani', VIERNES: 'mem-guille' },
  'act-22': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-dani', VIERNES: 'mem-guille' },
  'act-23': { ...emptyDays(), LUNES: 'mem-guille', MARTES: 'mem-guille', MIERCOLES: 'mem-dani', JUEVES: 'mem-dani', VIERNES: 'mem-guille', SABADO: 'mem-dani', DOMINGO: 'mem-dani' },
  'act-24': { ...emptyDays(), LUNES: 'mem-dani', MARTES: 'mem-dani', MIERCOLES: 'mem-guille', JUEVES: 'mem-guille', VIERNES: 'mem-dani', DOMINGO: 'mem-guille' },
  'act-25': { ...emptyDays(), LUNES: 'mem-mathias', MARTES: 'mem-mathias', MIERCOLES: 'mem-mathias', JUEVES: 'mem-mathias', VIERNES: 'mem-mathias', SABADO: 'mem-mathias', DOMINGO: 'mem-mathias' },
  'act-26': { ...emptyDays(), DOMINGO: 'mem-guille' },
  'act-27': { ...emptyDays(), LUNES: 'mem-dani' },
  'act-28': { ...emptyDays(), LUNES: 'mem-dani', SABADO: 'mem-dani' },
  'act-29': { ...emptyDays(), LUNES: 'mem-dani', SABADO: 'mem-dani' },
  'act-30': { ...emptyDays(), MARTES: 'mem-guille', VIERNES: 'mem-guille' },
  'act-31': { ...emptyDays(), MARTES: 'mem-guille', JUEVES: 'mem-guille', SABADO: 'mem-guille' },
  'act-32': { ...emptyDays(), MARTES: 'mem-dani', JUEVES: 'mem-dani', SABADO: 'mem-dani' },
  'act-33': { ...emptyDays(), MIERCOLES: 'mem-dani', VIERNES: 'mem-dani', DOMINGO: 'mem-dani' },
};
