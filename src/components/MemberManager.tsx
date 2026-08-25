import React, { useState } from 'react';
import type { FamilyMember } from '../types';
import { Plus, Trash2, Edit2, Check, X, Palette } from 'lucide-react';

interface Props {
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, 'id'>) => void;
  onUpdateMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
}

const PRESET_COLORS = [
  { name: 'Verde Menta', bg: '#86efac', text: '#064e3b' },
  { name: 'Amarillo Cálido', bg: '#fde047', text: '#713f12' },
  { name: 'Naranja Vivo', bg: '#fdba74', text: '#7c2d12' },
  { name: 'Rosa Suave', bg: '#f472b6', text: '#831843' },
  { name: 'Azul Pastel', bg: '#93c5fd', text: '#1e3a8a' },
  { name: 'Morado Claro', bg: '#c084fc', text: '#581c87' },
  { name: 'Cian Fresco', bg: '#67e8f9', text: '#164e63' },
  { name: 'Gris Neutro', bg: '#cbd5e1', text: '#0f172a' },
];

export const MemberManager: React.FC<Props> = ({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'PADRE' | 'HIJO' | 'OTRO'>('PADRE');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0].bg);
  const [newTextColor, setNewTextColor] = useState(PRESET_COLORS[0].text);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'PADRE' | 'HIJO' | 'OTRO'>('PADRE');
  const [editColor, setEditColor] = useState('');
  const [editTextColor, setEditTextColor] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddMember({
      name: newName.trim(),
      role: newRole,
      color: newColor,
      textColor: newTextColor,
    });

    setNewName('');
    setIsAdding(false);
  };

  const startEdit = (m: FamilyMember) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditRole(m.role);
    setEditColor(m.color);
    setEditTextColor(m.textColor);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateMember({
      id,
      name: editName.trim(),
      role: editRole,
      color: editColor,
      textColor: editTextColor,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Integrantes de la Familia</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra los miembros y sus colores identificadores para el plan de tareas
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          <span>Nuevo Miembro</span>
        </button>
      </div>

      {/* Formulario de Agregar */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-extrabold text-indigo-900 uppercase tracking-wider">Agregar Nuevo Miembro</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: DANI, GUILLE..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Rol</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PADRE">PADRE / ADULTO</option>
                <option value="HIJO">HIJO / JOVEN</option>
                <option value="OTRO">GRUPO / OTRO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Palette size={13} />
                Paleta de Color
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setNewColor(c.bg);
                      setNewTextColor(c.text);
                    }}
                    className={`w-6 h-6 rounded-full border border-black/10 cursor-pointer transition-transform ${
                      newColor === c.bg ? 'ring-2 ring-indigo-600 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.bg }}
                    title={c.name}
                  />
                ))}
              </div>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Guardar Miembro
            </button>
          </div>
        </form>
      )}

      {/* Grid Responsive de Tarjetas de Integrantes (Sin barra/etiqueta extra) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => {
          const isEditing = editingId === m.id;

          if (isEditing) {
            return (
              <div key={m.id} className="bg-white border border-indigo-200 rounded-3xl p-5 shadow-sm space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white"
                />
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="PADRE">PADRE</option>
                  <option value="HIJO">HIJO</option>
                  <option value="OTRO">GRUPO / OTRO</option>
                </select>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setEditColor(c.bg);
                        setEditTextColor(c.text);
                      }}
                      className={`w-5 h-5 rounded-full border border-black/10 cursor-pointer ${
                        editColor === c.bg ? 'ring-2 ring-indigo-600 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c.bg }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => saveEdit(m.id)}
                    className="p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 cursor-pointer"
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-xs border border-black/5 uppercase shrink-0"
                  style={{ backgroundColor: m.color, color: m.textColor }}
                >
                  {m.name.slice(0, 2)}
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {m.name}
                </h3>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(m)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  title="Editar Miembro"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDeleteMember(m.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                  title="Eliminar Miembro"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
