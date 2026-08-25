import React from 'react';
import type { Activity, FamilyMember, DayOfWeek, CompletionRecord } from '../types';
import { X, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  activity: Activity | null;
  day: DayOfWeek | null;
  dateISO: string | null;
  dateFormatted: string | null;
  assignedMember: FamilyMember | undefined;
  currentCompletion: CompletionRecord | undefined;
  members: FamilyMember[];
  onSave: (completed: boolean, completedBy: string, notes?: string) => void;
  onClose: () => void;
}

export const CompletionModal: React.FC<Props> = ({
  isOpen,
  activity,
  day,
  dateISO,
  dateFormatted,
  assignedMember,
  members,
  onSave,
  onClose,
}) => {
  if (!isOpen || !activity || !day) return null;

  // Single tap on any member pill instantly saves and closes
  const handleSelectMember = (memberId: string) => {
    onSave(true, memberId);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 relative cursor-default"
      >
        {/* Botón X de Cierre (Cancela sin guardar) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Cancelar"
        >
          <X size={20} />
        </button>

        {/* Encabezado con Fecha y Turno */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={13} />
              {day} {dateFormatted || ''}
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase">
              {activity.slot}
            </span>
          </div>

          {/* Nombre de la Actividad + Persona Asignada */}
          <div className="flex items-center gap-2.5 mt-3 flex-wrap">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {activity.name}
            </h3>
            {assignedMember && (
              <span
                className="px-3.5 py-1 rounded-full text-xs font-extrabold shadow-xs uppercase tracking-wide border border-black/5"
                style={{ backgroundColor: assignedMember.color, color: assignedMember.textColor }}
                title="Persona Asignada"
              >
                {assignedMember.name}
              </span>
            )}
          </div>
        </div>

        {/* Selección Instantánea (Tocar persona guarda y cierra sin pre-selección) */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider">
            ¿Quién la realizó? (Toca una persona para marcar)
          </label>
          <div className="flex flex-wrap gap-2.5">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMember(m.id)}
                className="px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wide transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs border border-black/5 hover:shadow-md"
                style={{
                  backgroundColor: m.color,
                  color: m.textColor,
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
