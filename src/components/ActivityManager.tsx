import React, { useState } from 'react';
import type { Activity, TimeSlot } from '../types';
import { Plus, Trash2, Edit2, Check, X, ClipboardList, Sunrise, Sun, Moon } from 'lucide-react';

interface Props {
  activities: Activity[];
  onAddActivity: (activity: Omit<Activity, 'id' | 'order'>) => void;
  onUpdateActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
}

export const ActivityManager: React.FC<Props> = ({
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}) => {
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<TimeSlot>('MAÑANA');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlot, setNewSlot] = useState<TimeSlot>('MAÑANA');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlot, setEditSlot] = useState<TimeSlot>('MAÑANA');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddActivity({
      name: newName.trim(),
      slot: newSlot,
    });

    setNewName('');
    setIsAdding(false);
  };

  const startEdit = (a: Activity) => {
    setEditingId(a.id);
    setEditName(a.name);
    setEditSlot(a.slot);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    const act = activities.find((a) => a.id === id);
    if (!act) return;

    onUpdateActivity({
      ...act,
      name: editName.trim(),
      slot: editSlot,
    });
    setEditingId(null);
  };

  const visibleSlots: TimeSlot[] = [selectedSlotFilter];

  return (
    <div className="space-y-6">
      {/* Tarjeta de Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <ClipboardList size={24} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Administrador de Actividades del Hogar
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Crea, edita o elimina tareas organizadas en los turnos Mañana, Tarde y Noche.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          <span>Nueva Actividad</span>
        </button>
      </div>

      {/* Selector de Turno a TODO EL ANCHO (w-full) */}
      <div className="w-full flex items-center bg-slate-200/80 p-1.5 rounded-full border border-slate-300/80 shadow-inner">
        <button
          type="button"
          onClick={() => setSelectedSlotFilter('MAÑANA')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            selectedSlotFilter === 'MAÑANA'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <Sunrise size={16} />
          <span>MAÑANA</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedSlotFilter('TARDE')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            selectedSlotFilter === 'TARDE'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <Sun size={16} />
          <span>TARDE</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedSlotFilter('NOCHE')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            selectedSlotFilter === 'NOCHE'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          <Moon size={16} />
          <span>NOCHE</span>
        </button>
      </div>

      {/* Formulario de Agregar */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-extrabold text-emerald-900 uppercase tracking-wider">Agregar Nueva Actividad</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nombre de la Tarea</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: SACAR MAX MAÑANA, BARRER PISO..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Turno del Día</label>
              <select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value as TimeSlot)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="MAÑANA">MAÑANA</option>
                <option value="TARDE">TARDE</option>
                <option value="NOCHE">NOCHE</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Guardar Actividad
            </button>
          </div>
        </form>
      )}

      {/* Lista Filtrada por el Turno Seleccionado (Estática, sin Drag & Drop) */}
      <div className="space-y-6">
        {visibleSlots.map((slot) => {
          const slotActs = activities.filter((a) => a.slot === slot);
          return (
            <div key={slot} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {slot === 'MAÑANA' && <Sunrise size={18} className="text-amber-500" />}
                  {slot === 'TARDE' && <Sun size={18} className="text-orange-500" />}
                  {slot === 'NOCHE' && <Moon size={18} className="text-indigo-600" />}
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    TURNO {slot} ({slotActs.length})
                  </h3>
                </div>
              </div>

              {slotActs.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No hay actividades registradas en este turno.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slotActs.map((act) => {
                    const isEditing = editingId === act.id;

                    if (isEditing) {
                      return (
                        <div key={act.id} className="p-3 bg-slate-50 border border-emerald-200 rounded-2xl space-y-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          />
                          <select
                            value={editSlot}
                            onChange={(e) => setEditSlot(e.target.value as TimeSlot)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                          >
                            <option value="MAÑANA">MAÑANA</option>
                            <option value="TARDE">TARDE</option>
                            <option value="NOCHE">NOCHE</option>
                          </select>
                          <div className="flex items-center justify-end gap-1 pt-1">
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                            <button
                              onClick={() => saveEdit(act.id)}
                              className="p-1 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 cursor-pointer"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={act.id}
                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all"
                      >
                        <span className="text-xs font-bold text-slate-800 truncate" title={act.name}>
                          {act.name}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEdit(act)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteActivity(act.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
