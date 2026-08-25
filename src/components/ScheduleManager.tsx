import React, { useState, useRef } from 'react';
import type { Activity, FamilyMember, ScheduleMap, DayOfWeek, TimeSlot } from '../types';
import { DAYS } from '../types';
import { Calendar, Sunrise, Sun, Moon, GripVertical } from 'lucide-react';

interface Props {
  activities: Activity[];
  members: FamilyMember[];
  schedule: ScheduleMap;
  onUpdateAssignment: (activityId: string, day: DayOfWeek, memberId: string) => void;
  onMoveActivity?: (sourceId: string, targetId: string) => void;
}

export const ScheduleManager: React.FC<Props> = ({
  activities,
  members,
  schedule,
  onUpdateAssignment,
  onMoveActivity,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>('MAÑANA');
  const [selectedMobileDay, setSelectedMobileDay] = useState<DayOfWeek>('LUNES');

  // Drag & Drop State
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
  const [dragOverActivityId, setDragOverActivityId] = useState<string | null>(null);

  // Touch Long Press State
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [touchDraggingId, setTouchDraggingId] = useState<string | null>(null);

  const filteredActivities = activities.filter((a) => a.slot === selectedSlot);

  // HTML5 Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedActivityId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverActivityId !== id) {
      setDragOverActivityId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedActivityId && draggedActivityId !== targetId) {
      onMoveActivity?.(draggedActivityId, targetId);
    }
    setDraggedActivityId(null);
    setDragOverActivityId(null);
  };

  const handleDragEnd = () => {
    setDraggedActivityId(null);
    setDragOverActivityId(null);
  };

  // Touch Handlers (Long Press 300ms + Drag Drop)
  const handleTouchStart = (id: string) => {
    touchTimerRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(40);
      setTouchDraggingId(id);
    }, 300);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    if (touchDraggingId && dragOverActivityId && touchDraggingId !== dragOverActivityId) {
      onMoveActivity?.(touchDraggingId, dragOverActivityId);
    }
    setTouchDraggingId(null);
    setDragOverActivityId(null);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Administrador de Calendario y Asignación Semanal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Asigna quién es responsable de realizar cada actividad. Arrastra o mantén presionado el icono :: para reordenar.
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Turnos y Selector Móvil / SM */}
      <div className="space-y-3">
        {/* Turnos: MAÑANA | TARDE | NOCHE a todo el ancho */}
        <div className="w-full flex items-center bg-slate-200/80 p-1.5 rounded-full border border-slate-300/80 shadow-inner">
          <button
            type="button"
            onClick={() => setSelectedSlot('MAÑANA')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              selectedSlot === 'MAÑANA'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Sunrise size={16} />
            <span>MAÑANA</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSlot('TARDE')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              selectedSlot === 'TARDE'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Sun size={16} />
            <span>TARDE</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSlot('NOCHE')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              selectedSlot === 'NOCHE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Moon size={16} />
            <span>NOCHE</span>
          </button>
        </div>

        {/* Selector de Días PARA XS Y SM (< 768px / md:hidden) */}
        <div className="block md:hidden">
          <div className="w-full flex items-center bg-slate-200/90 p-1 rounded-full border border-slate-300/80 shadow-inner">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedMobileDay(day)}
                className={`flex-1 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer text-center ${
                  selectedMobileDay === day
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Asignaciones Inteligente con Icono GripVertical y Draggable */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-xs font-extrabold text-slate-700">
                <th className="py-3.5 px-4 uppercase tracking-wider w-56 sm:w-64">ACTIVIDAD</th>
                
                {/* VISTA XS Y SM (< 768px / md:hidden): Muestra el día seleccionado */}
                <th className="py-3.5 px-2 text-center uppercase tracking-wider text-xs md:hidden bg-amber-100 text-amber-950 font-black">
                  {selectedMobileDay}
                </th>

                {/* VISTA MD, LG, XL, 2XL (>= 768px / hidden md:table-cell): 3 letras en MD (< lg) y Nombre Completo en LG+ (>= 1024px) */}
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="py-3.5 px-1 sm:px-2 text-center uppercase tracking-wider text-[11px] sm:text-xs hidden md:table-cell border-r border-slate-200/80 last:border-r-0"
                  >
                    <span className="lg:hidden">{day.slice(0, 3)}</span>
                    <span className="hidden lg:inline">{day}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredActivities.map((act) => {
                const isBeingDragged = draggedActivityId === act.id || touchDraggingId === act.id;
                const isDragOver = dragOverActivityId === act.id && !isBeingDragged;

                return (
                  <tr
                    key={act.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, act.id)}
                    onDragOver={(e) => handleDragOver(e, act.id)}
                    onDrop={(e) => handleDrop(e, act.id)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={() => handleTouchStart(act.id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={() => {
                      if (touchDraggingId) {
                        setDragOverActivityId(act.id);
                      }
                    }}
                    className={`transition-all ${
                      isBeingDragged ? 'opacity-40 bg-indigo-50/70 shadow-inner' : 'hover:bg-slate-50'
                    } ${isDragOver ? 'border-t-2 border-indigo-500 bg-indigo-50/40' : ''}`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <GripVertical size={15} className="text-slate-400 shrink-0 cursor-grab active:cursor-grabbing" />
                        <span className="truncate max-w-[170px] sm:max-w-[220px]" title={act.name}>
                          {act.name}
                        </span>
                      </div>
                    </td>

                    {/* VISTA XS Y SM (< 768px / md:hidden): Muestra el NOMBRE COMPLETO sin flecha */}
                    <td className="p-2 text-center align-middle md:hidden">
                      {(() => {
                        const day = selectedMobileDay;
                        const currentMemberId = schedule[act.id]?.[day] || '';
                        const assignedMember = members.find((m) => m.id === currentMemberId);

                        return (
                          <select
                            value={currentMemberId}
                            onChange={(e) => onUpdateAssignment(act.id, day, e.target.value)}
                            className="w-full max-w-[150px] px-3 py-1.5 rounded-full text-xs font-black shadow-xs transition-all cursor-pointer border border-black/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center uppercase tracking-wide appearance-none"
                            style={{
                              backgroundColor: assignedMember ? assignedMember.color : '#f1f5f9',
                              color: assignedMember ? assignedMember.textColor : '#64748b',
                            }}
                          >
                            <option value="" className="bg-white text-slate-700 font-bold">
                              — Vacío —
                            </option>
                            {members.map((m) => (
                              <option key={m.id} value={m.id} className="bg-white text-slate-800 font-bold">
                                {m.name}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                    </td>

                    {/* VISTA MD, LG, XL, 2XL (>= 768px): Iniciales (DA, GU, SA) en MD (< lg) / Nombre Completo (DANI, GUILLE) a partir de LG (>= 1024px) */}
                    {DAYS.map((day) => {
                      const currentMemberId = schedule[act.id]?.[day] || '';
                      const assignedMember = members.find((m) => m.id === currentMemberId);

                      return (
                        <td key={day} className="p-1 text-center align-middle hidden md:table-cell border-r border-slate-200/80 last:border-r-0">
                          {/* Selector para MD (< lg / < 1024px): Muestra Iniciales (DA, GU, SA) */}
                          <div className="lg:hidden flex justify-center">
                            <select
                              value={currentMemberId}
                              onChange={(e) => onUpdateAssignment(act.id, day, e.target.value)}
                              className="w-full max-w-[65px] md:max-w-[75px] px-1.5 py-1.5 rounded-full text-xs font-black shadow-xs transition-all cursor-pointer border border-black/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center uppercase tracking-wider appearance-none"
                              style={{
                                backgroundColor: assignedMember ? assignedMember.color : '#f1f5f9',
                                color: assignedMember ? assignedMember.textColor : '#64748b',
                              }}
                            >
                              <option value="" className="bg-white text-slate-700 font-bold">
                                —
                              </option>
                              {members.map((m) => (
                                <option key={m.id} value={m.id} className="bg-white text-slate-800 font-bold">
                                  {m.name.slice(0, 2)}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Selector para LG+ (>= 1024px): Muestra Nombre Completo (DANI, GUILLE, SANTIAGO) */}
                          <div className="hidden lg:flex justify-center">
                            <select
                              value={currentMemberId}
                              onChange={(e) => onUpdateAssignment(act.id, day, e.target.value)}
                              className="w-full max-w-[95px] xl:max-w-[125px] px-2 py-1.5 rounded-full text-xs font-black shadow-xs transition-all cursor-pointer border border-black/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center uppercase tracking-wide appearance-none"
                              style={{
                                backgroundColor: assignedMember ? assignedMember.color : '#f1f5f9',
                                color: assignedMember ? assignedMember.textColor : '#64748b',
                              }}
                            >
                              <option value="" className="bg-white text-slate-700 font-bold">
                                — Vacío —
                              </option>
                              {members.map((m) => (
                                <option key={m.id} value={m.id} className="bg-white text-slate-800 font-bold">
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
