import React, { useState, useRef } from 'react';
import type { Activity, FamilyMember, ScheduleMap, CompletionsMap, DayOfWeek, TimeSlot } from '../types';
import { CompletionModal } from './CompletionModal';
import { getDarkerColor, getSaturatedPendingColor } from '../utils/colors';
import {
  getMondayOfDate,
  formatDateISO,
  parseISOToDate,
  getWeekDates,
  formatWeekRange,
} from '../utils/dates';
import { CheckCircle2, Calendar as CalendarIcon, Award, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  activities: Activity[];
  members: FamilyMember[];
  schedule: ScheduleMap;
  completions: CompletionsMap;
  activeWeekMondayISO: string;
  onSelectMondayISO: (mondayISO: string) => void;
  onToggleCompletion: (dateISO: string, activityId: string, day: DayOfWeek, completed: boolean, completedBy: string, notes?: string) => void;
}

const LONG_PRESS_DURATION = 420; // ms for long press on tablet/touch

export const DashboardTable: React.FC<Props> = ({
  activities,
  members,
  schedule,
  completions,
  activeWeekMondayISO,
  onSelectMondayISO,
  onToggleCompletion,
}) => {
  const [dayFilter, setDayFilter] = useState<DayOfWeek | 'TODOS'>('TODOS');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | 'TODOS'>('TODOS');

  // Single Day Selection for Mobile / Small Screens (< 768px): Inicializado en el día actual (HOY)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    const today = new Date();
    const dayNum = today.getDay(); // 0 es Domingo, 1 es Lunes...
    return dayNum === 0 ? 6 : dayNum - 1; // 0 = LUNES, ..., 6 = DOMINGO
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetActivity, setTargetActivity] = useState<Activity | null>(null);
  const [targetDay, setTargetDay] = useState<DayOfWeek | null>(null);
  const [targetDateISO, setTargetDateISO] = useState<string | null>(null);
  const [targetDateFormatted, setTargetDateFormatted] = useState<string | null>(null);

  // Long Press Refs
  const isLongPressRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Date Picker Hidden Input Ref
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Parse Monday Date of currently selected week
  const currentMondayDate = parseISOToDate(activeWeekMondayISO);
  const weekDates = getWeekDates(currentMondayDate);
  const weekRangeLabel = formatWeekRange(currentMondayDate);

  // Real today ISO
  const realTodayISO = formatDateISO(new Date());

  // Navigation Handlers for Desktop (Week by Week)
  const handlePrevWeek = () => {
    const prevMon = new Date(currentMondayDate);
    prevMon.setDate(currentMondayDate.getDate() - 7);
    onSelectMondayISO(formatDateISO(prevMon));
  };

  const handleNextWeek = () => {
    const nextMon = new Date(currentMondayDate);
    nextMon.setDate(currentMondayDate.getDate() + 7);
    onSelectMondayISO(formatDateISO(nextMon));
  };

  // Navigation Handlers for Mobile (< 768px) (Day by Day)
  const handlePrevDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex((prev) => prev - 1);
    } else {
      const prevMon = new Date(currentMondayDate);
      prevMon.setDate(currentMondayDate.getDate() - 7);
      onSelectMondayISO(formatDateISO(prevMon));
      setSelectedDayIndex(6);
    }
  };

  const handleNextDay = () => {
    if (selectedDayIndex < 6) {
      setSelectedDayIndex((prev) => prev + 1);
    } else {
      const nextMon = new Date(currentMondayDate);
      nextMon.setDate(currentMondayDate.getDate() + 7);
      onSelectMondayISO(formatDateISO(nextMon));
      setSelectedDayIndex(0);
    }
  };

  const handleCurrentWeekOrDay = () => {
    const todayDate = new Date();
    const realMon = getMondayOfDate(todayDate);
    onSelectMondayISO(formatDateISO(realMon));

    const dayNum = todayDate.getDay();
    const index = dayNum === 0 ? 6 : dayNum - 1;
    setSelectedDayIndex(index);
  };

  const handleCalendarIconClick = () => {
    if (hiddenDateInputRef.current) {
      if ('showPicker' in hiddenDateInputRef.current) {
        try {
          hiddenDateInputRef.current.showPicker();
        } catch (e) {
          hiddenDateInputRef.current.click();
        }
      } else {
        hiddenDateInputRef.current.click();
      }
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const pickedDate = parseISOToDate(e.target.value);
    const pickedMonday = getMondayOfDate(pickedDate);
    onSelectMondayISO(formatDateISO(pickedMonday));

    const dayNum = pickedDate.getDay();
    const index = dayNum === 0 ? 6 : dayNum - 1;
    setSelectedDayIndex(index);
  };

  // Helper to retrieve completion key bound to dateISO
  const getCompletionKey = (dateISO: string, actId: string) => `${dateISO}_${actId}`;

  // Long Press Handlers for Tablet / Touch & Mouse
  const startPress = (activity: Activity, day: DayOfWeek, dateISO: string, dateFormatted: string) => {
    isLongPressRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;

      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        try { navigator.vibrate(40); } catch (e) {}
      }

      setTargetActivity(activity);
      setTargetDay(day);
      setTargetDateISO(dateISO);
      setTargetDateFormatted(dateFormatted);
      setModalOpen(true);
    }, LONG_PRESS_DURATION);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Tap / Click Handler
  const handleCellClick = (activity: Activity, day: DayOfWeek, dateISO: string, dateFormatted: string) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }

    const assignedId = schedule[activity.id]?.[day] || '';

    if (!assignedId) {
      setTargetActivity(activity);
      setTargetDay(day);
      setTargetDateISO(dateISO);
      setTargetDateFormatted(dateFormatted);
      setModalOpen(true);
      return;
    }

    const compKey = getCompletionKey(dateISO, activity.id);
    const existing = completions[compKey];
    const isCurrentlyDone = !!existing?.completed;

    if (isCurrentlyDone) {
      onToggleCompletion(dateISO, activity.id, day, false, assignedId);
    } else {
      onToggleCompletion(dateISO, activity.id, day, true, assignedId);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((a) => {
    if (selectedSlot !== 'TODOS' && a.slot !== selectedSlot) return false;
    return true;
  });

  // Calculate statistics for the active week
  let totalAssignedSlots = 0;
  let completedCount = 0;
  const memberCompletionStats: Record<string, number> = {};

  activities.forEach((act) => {
    weekDates.forEach(({ day, dateISO }) => {
      if (dayFilter !== 'TODOS' && day !== dayFilter) return;
      const assignedId = schedule[act.id]?.[day];
      const key = getCompletionKey(dateISO, act.id);
      const comp = completions[key];

      if (assignedId || (comp && comp.completed)) {
        totalAssignedSlots++;
        if (comp && comp.completed) {
          completedCount++;
          const doerId = comp.completedBy || assignedId;
          if (doerId) {
            memberCompletionStats[doerId] = (memberCompletionStats[doerId] || 0) + 1;
          }
        }
      }
    });
  });

  const completionPercentage = totalAssignedSlots > 0 ? Math.round((completedCount / totalAssignedSlots) * 100) : 0;

  // Find top performer
  let topMemberId = '';
  let maxCompleted = 0;
  Object.entries(memberCompletionStats).forEach(([memId, count]) => {
    if (count > maxCompleted) {
      maxCompleted = count;
      topMemberId = memId;
    }
  });
  const topMember = members.find((m) => m.id === topMemberId);

  // Group activities by slot
  const slots: TimeSlot[] = ['MAÑANA', 'TARDE', 'NOCHE'];

  // Filtered visible week dates for DESKTOP (MD+)
  const visibleWeekDatesDesktop = weekDates.filter(({ day }) => dayFilter === 'TODOS' || dayFilter === day);

  // Single date for MOBILE (< 768px)
  const singleMobileDate = weekDates[selectedDayIndex] || weekDates[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Panel Superior Limpio Adaptativo (Cumplimiento Semanal y Líder) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Stat 1: Cumplimiento Semanal */}
        <div className="flex items-center gap-3.5 flex-1 w-full md:w-auto">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle2 size={20} className="sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Cumplimiento Semanal</span>
              <span className="text-xs sm:text-sm text-slate-800 font-extrabold">
                {completedCount} / {totalAssignedSlots} ({completionPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-200" />

        {/* Stat 2: Líder en Tareas */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
              <Award size={18} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Líder:</span>
          </div>
          {topMember ? (
            <span
              className="px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-xs uppercase tracking-wide border border-black/5"
              style={{ backgroundColor: topMember.color, color: topMember.textColor }}
            >
              {topMember.name} ({maxCompleted})
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">Sin tareas</span>
          )}
        </div>
      </div>

      {/* Main Table Container estilo Matriz Limpia Adaptativa */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header Toolbar Limpio Adaptativo */}
        <div className="p-3.5 sm:p-4.5 border-b border-slate-200 flex flex-row items-center justify-between gap-3 bg-slate-50/60">
          {/* Título Arriba y Fechas Abajo: Oculto en XS y SM (< 768px / hidden md:block) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <CalendarIcon size={18} />
            </div>
            <div className="hidden md:block">
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight whitespace-nowrap">
                Plan de Limpieza del Hogar
              </h2>
              <span className="text-xs text-slate-500 font-bold block mt-0.5 whitespace-nowrap">
                {weekRangeLabel}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BARRA DE FILTROS AUMENTADA A h-10 (40px) DE ALTURA HOMOGÉNEA */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2 flex-wrap py-0.5">
            {/* 1. FILTRO DE DÍAS: Combo en MD (< lg) / Pastillas en LG+ (≥ 1024px) */}
            <div className="hidden md:block lg:hidden">
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value as any)}
                className="h-10 px-4 bg-slate-200/90 hover:bg-slate-300 border border-slate-300/80 rounded-full text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs uppercase tracking-wide appearance-none text-center inline-flex items-center justify-center"
              >
                <option value="TODOS" className="bg-white text-slate-800 font-bold">
                  DÍAS: TODOS
                </option>
                {weekDates.map(({ day, dateISO }) => (
                  <option key={day} value={day} className="bg-white text-slate-800 font-bold">
                    {day} {dateISO === realTodayISO ? '(HOY)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden lg:flex items-center gap-1 h-10 bg-slate-200/80 p-1 rounded-full border border-slate-300/60 shrink-0">
              <button
                type="button"
                onClick={() => setDayFilter('TODOS')}
                className={`h-8 px-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  dayFilter === 'TODOS' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                TODOS
              </button>
              {weekDates.map(({ day, dateISO }) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => setDayFilter(day)}
                  className={`h-8 px-2.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                    dayFilter === day
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : dateISO === realTodayISO
                      ? 'bg-amber-300 text-amber-950 font-black border border-amber-400'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* 2. FILTRO DE JORNADA: Con 'JORNADA:' en XS-MD / Sin 'JORNADA:' en LG / Pastillas en XL */}
            <div className="lg:hidden">
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value as any)}
                className="h-10 px-4 bg-slate-200/90 hover:bg-slate-300 border border-slate-300/80 rounded-full text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs uppercase tracking-wide appearance-none text-center inline-flex items-center justify-center"
              >
                <option value="TODOS" className="bg-white text-slate-800 font-bold">
                  JORNADA: TODAS
                </option>
                <option value="MAÑANA" className="bg-white text-slate-800 font-bold">MAÑANA</option>
                <option value="TARDE" className="bg-white text-slate-800 font-bold">TARDE</option>
                <option value="NOCHE" className="bg-white text-slate-800 font-bold">NOCHE</option>
              </select>
            </div>

            <div className="hidden lg:block xl:hidden">
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value as any)}
                className="h-10 px-4 bg-slate-200/90 hover:bg-slate-300 border border-slate-300/80 rounded-full text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs uppercase tracking-wide appearance-none text-center inline-flex items-center justify-center"
              >
                <option value="TODOS" className="bg-white text-slate-800 font-bold">
                  TODAS
                </option>
                <option value="MAÑANA" className="bg-white text-slate-800 font-bold">MAÑANA</option>
                <option value="TARDE" className="bg-white text-slate-800 font-bold">TARDE</option>
                <option value="NOCHE" className="bg-white text-slate-800 font-bold">NOCHE</option>
              </select>
            </div>

            <div className="hidden xl:flex items-center gap-1 h-10 bg-slate-200/80 p-1 rounded-full border border-slate-300/60 shrink-0">
              {(['TODOS', 'MAÑANA', 'TARDE', 'NOCHE'] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSelectedSlot(s)}
                  className={`h-8 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    selectedSlot === s ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* 3. BOTÓN HOY (h-10 / 40px) */}
            <button
              type="button"
              onClick={handleCurrentWeekOrDay}
              className="h-10 px-4 bg-amber-300 hover:bg-amber-400 text-amber-950 font-black rounded-full text-xs transition-all shadow-xs cursor-pointer border border-amber-400/80 uppercase tracking-tight shrink-0 flex items-center justify-center"
              title="Ir al Día/Semana Actual"
            >
              HOY
            </button>

            {/* 4. ICONO CALENDARIO (h-10 w-10 / 40px) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={handleCalendarIconClick}
                className="h-10 w-10 bg-slate-200/90 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-full transition-all cursor-pointer shadow-xs border border-slate-300/80 flex items-center justify-center"
                title="Seleccionar fecha en calendario"
              >
                <CalendarIcon size={17} />
              </button>
              <input
                ref={hiddenDateInputRef}
                type="date"
                onChange={handleDatePickerChange}
                className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Tabla responsive con Scroll Táctil */}
        <div className="overflow-x-auto touch-scrolling">
          <table className="w-full border-collapse text-left min-w-full">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-xs font-extrabold text-slate-700">
                {/* Columna ACTIVIDAD */}
                <th className="py-3 px-2 sm:px-4 w-[65%] md:w-48 lg:w-64 uppercase tracking-wider sticky left-0 bg-slate-100 z-20 border-r border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-slate-800 tracking-wider text-[10px] md:text-xs">ACTIVIDAD</span>
                    
                    {/* Flecha Izquierda (<) */}
                    <button
                      onClick={handlePrevDay}
                      className="p-1 bg-slate-200/90 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-full transition-all cursor-pointer shadow-xs border border-slate-300/80 flex md:hidden items-center justify-center ml-auto"
                      title="Día Anterior"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={handlePrevWeek}
                      className="p-1 bg-slate-200/90 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-full transition-all cursor-pointer shadow-xs border border-slate-300/80 hidden md:flex items-center justify-center ml-auto"
                      title="Semana Anterior"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                </th>

                {/* ========================================================================= */}
                {/* VISTA MÓVIL (< 768px / md:hidden): 1 SOLO DÍA SELECCIONADO */}
                {/* ========================================================================= */}
                {(() => {
                  const { day, dateISO, dateFormatted } = singleMobileDate;
                  const isToday = dateISO === realTodayISO;

                  return (
                    <th
                      className={`py-3 px-2 text-center uppercase tracking-wider text-xs md:hidden border-r border-slate-200/80 last:border-r-0 w-[35%] ${
                        isToday ? 'bg-amber-100 text-amber-950 font-black' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between relative w-full">
                        <div className="flex flex-col items-center justify-center gap-0.5 mx-auto">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-extrabold text-xs">{day.slice(0, 3)}</span>
                            {isToday && (
                              <span className="text-[8px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black tracking-tight">
                                HOY
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 lowercase tracking-normal">
                            {dateFormatted}
                          </span>
                        </div>

                        {/* Flecha Derecha (>) */}
                        <button
                          onClick={handleNextDay}
                          className="p-1 bg-slate-200/90 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-full transition-all cursor-pointer shadow-xs border border-slate-300/80 flex items-center justify-center"
                          title="Día Siguiente"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </th>
                  );
                })()}

                {/* ========================================================================= */}
                {/* VISTA ESCRITORIO (≥ 768px / hidden md:table-cell): LOS 7 DÍAS DE LA SEMANA */}
                {/* ========================================================================= */}
                {visibleWeekDatesDesktop.map(({ day, dateISO, dateFormatted }, index) => {
                  const isToday = dateISO === realTodayISO;
                  const isLastColumn = index === visibleWeekDatesDesktop.length - 1;

                  return (
                    <th
                      key={day}
                      className={`py-2.5 px-1 text-center uppercase tracking-wider text-[11px] md:text-xs hidden md:table-cell border-r border-slate-200/80 last:border-r-0 ${
                        isToday ? 'bg-amber-100 text-amber-950 font-black' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center relative">
                        <div className="flex flex-col items-center justify-center gap-0.5 mx-auto">
                          <div className="flex items-center justify-center gap-0.5">
                            <span className="lg:hidden">{day.slice(0, 3)}</span>
                            <span className="hidden lg:inline">{day}</span>
                            {isToday && (
                              <span className="text-[9px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black tracking-tight hidden lg:inline-block">
                                HOY
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 lowercase tracking-normal">
                            {dateFormatted}
                          </span>
                        </div>

                        {/* Flecha SEMANA SIGUIENTE */}
                        {isLastColumn && (
                          <button
                            onClick={handleNextWeek}
                            className="p-1 bg-slate-200/90 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-full transition-all cursor-pointer shadow-xs border border-slate-300/80 flex items-center justify-center ml-auto"
                            title="Semana Siguiente"
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {slots.map((slot) => {
                const slotActivities = filteredActivities.filter((a) => a.slot === slot);
                if (slotActivities.length === 0) return null;

                return (
                  <React.Fragment key={slot}>
                    {/* Fila divisoria de Turno */}
                    <tr className="bg-slate-100 text-slate-800 font-extrabold border-y border-slate-200">
                      <td
                        colSpan={8}
                        className="py-2 px-3 sm:px-4 uppercase tracking-wider text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                          <span>TURNO {slot}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Filas de Actividades de este turno */}
                    {slotActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                        {/* Celda Nombre de Actividad */}
                        <td className="py-2.5 px-2.5 sm:px-4 font-bold text-slate-800 sticky left-0 bg-white border-r border-slate-200 z-10 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="truncate max-w-[210px] sm:max-w-[260px] md:max-w-[165px] lg:max-w-[230px] text-[11px] md:text-xs" title={act.name}>
                              {act.name}
                            </span>
                          </div>
                        </td>

                        {/* VISTA MÓVIL (< 768px / md:hidden): CELDA DEL DÍA SELECCIONADO */}
                        {(() => {
                          const { day, dateISO, dateFormatted } = singleMobileDate;
                          const assignedId = schedule[act.id]?.[day] || '';
                          const assignedMember = members.find((m) => m.id === assignedId);
                          const compKey = getCompletionKey(dateISO, act.id);
                          const completion = completions[compKey];
                          const isDone = !!completion?.completed;
                          const actualDoer = completion?.completedBy
                            ? members.find((m) => m.id === completion.completedBy)
                            : assignedMember;

                          const isToday = dateISO === realTodayISO;

                          return (
                            <td
                              onMouseDown={() => startPress(act, day, dateISO, dateFormatted)}
                              onMouseUp={cancelPress}
                              onMouseLeave={cancelPress}
                              onTouchStart={() => startPress(act, day, dateISO, dateFormatted)}
                              onTouchEnd={cancelPress}
                              onTouchMove={cancelPress}
                              onClick={() => handleCellClick(act, day, dateISO, dateFormatted)}
                              className={`p-0 text-center align-middle md:hidden border-r border-b border-slate-200/80 last:border-r-0 transition-all cursor-pointer select-none h-11 ${
                                isToday ? 'ring-1 ring-amber-400/40 z-10' : ''
                              }`}
                            >
                              {isDone && actualDoer ? (
                                (() => {
                                  const colorStyles = getDarkerColor(actualDoer.color, 18);
                                  return (
                                    <div
                                      className="w-full h-full min-h-[44px] px-1 font-black text-xs flex items-center justify-center transition-all duration-150 hover:brightness-105 active:scale-95 uppercase tracking-wide border-0 shadow-inner"
                                      style={{
                                        backgroundColor: colorStyles.bg,
                                        color: '#0f172a',
                                      }}
                                    >
                                      <span className="truncate">{actualDoer.name}</span>
                                    </div>
                                  );
                                })()
                              ) : assignedMember ? (
                                (() => {
                                  const satBg = getSaturatedPendingColor(assignedMember.color);
                                  return (
                                    <div
                                      className="w-full h-full min-h-[44px] px-1 font-extrabold text-xs flex items-center justify-center transition-all duration-150 hover:brightness-95 active:scale-95 uppercase tracking-wide border-0"
                                      style={{
                                        backgroundColor: satBg,
                                        color: assignedMember.textColor,
                                      }}
                                    >
                                      <span className="truncate">{assignedMember.name}</span>
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className="w-full h-full min-h-[44px] bg-slate-50/60 hover:bg-indigo-50 flex items-center justify-center text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all cursor-pointer">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })()}

                        {/* VISTA ESCRITORIO (≥ 768px / hidden md:table-cell): CELDAS DE LOS 7 DÍAS */}
                        {visibleWeekDatesDesktop.map(({ day, dateISO, dateFormatted }) => {
                          const assignedId = schedule[act.id]?.[day] || '';
                          const assignedMember = members.find((m) => m.id === assignedId);
                          const compKey = getCompletionKey(dateISO, act.id);
                          const completion = completions[compKey];
                          const isDone = !!completion?.completed;
                          const actualDoer = completion?.completedBy
                            ? members.find((m) => m.id === completion.completedBy)
                            : assignedMember;

                          const isToday = dateISO === realTodayISO;

                          return (
                            <td
                              key={day}
                              onMouseDown={() => startPress(act, day, dateISO, dateFormatted)}
                              onMouseUp={cancelPress}
                              onMouseLeave={cancelPress}
                              onTouchStart={() => startPress(act, day, dateISO, dateFormatted)}
                              onTouchEnd={cancelPress}
                              onTouchMove={cancelPress}
                              onClick={() => handleCellClick(act, day, dateISO, dateFormatted)}
                              className={`p-0 text-center align-middle hidden md:table-cell border-r border-b border-slate-200/80 last:border-r-0 transition-all cursor-pointer select-none h-10 ${
                                isToday ? 'ring-1 ring-amber-400/40 z-10' : ''
                              }`}
                            >
                              {isDone && actualDoer ? (
                                (() => {
                                  const colorStyles = getDarkerColor(actualDoer.color, 18);
                                  return (
                                    <div
                                      className="w-full h-full min-h-[40px] px-1 font-black text-xs flex items-center justify-center transition-all duration-150 hover:brightness-105 active:scale-95 uppercase tracking-wide border-0 shadow-inner"
                                      style={{
                                        backgroundColor: colorStyles.bg,
                                        color: '#0f172a',
                                      }}
                                    >
                                      <span className="truncate lg:hidden">{actualDoer.name.slice(0, 2)}</span>
                                      <span className="truncate hidden lg:inline">{actualDoer.name}</span>
                                    </div>
                                  );
                                })()
                              ) : assignedMember ? (
                                (() => {
                                  const satBg = getSaturatedPendingColor(assignedMember.color);
                                  return (
                                    <div
                                      className="w-full h-full min-h-[40px] px-1 font-extrabold text-xs flex items-center justify-center transition-all duration-150 hover:brightness-95 active:scale-95 uppercase tracking-wide border-0"
                                      style={{
                                        backgroundColor: satBg,
                                        color: assignedMember.textColor,
                                      }}
                                    >
                                      <span className="truncate lg:hidden">{assignedMember.name.slice(0, 2)}</span>
                                      <span className="truncate hidden lg:inline">{assignedMember.name}</span>
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className="w-full h-full min-h-[40px] bg-slate-50/60 hover:bg-indigo-50 flex items-center justify-center text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all cursor-pointer">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Marcación */}
      <CompletionModal
        isOpen={modalOpen}
        activity={targetActivity}
        day={targetDay}
        dateISO={targetDateISO}
        dateFormatted={targetDateFormatted}
        assignedMember={
          targetActivity && targetDay
            ? members.find((m) => m.id === schedule[targetActivity.id]?.[targetDay])
            : undefined
        }
        currentCompletion={
          targetActivity && targetDateISO
            ? completions[getCompletionKey(targetDateISO, targetActivity.id)]
            : undefined
        }
        members={members}
        onSave={(completed, completedBy, notes) => {
          if (targetActivity && targetDay && targetDateISO) {
            onToggleCompletion(targetDateISO, targetActivity.id, targetDay, completed, completedBy, notes);
          }
        }}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
