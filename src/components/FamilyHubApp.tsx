import React, { useState, useEffect, useRef } from 'react';
import type { AppState, FamilyMember, Activity, ScheduleMap, DayOfWeek } from '../types';
import { getInitialState, saveState, resetToDefaults } from '../utils/storage';
import { DashboardTable } from './DashboardTable';
import { MemberManager } from './MemberManager';
import { ActivityManager } from './ActivityManager';
import { ScheduleManager } from './ScheduleManager';
import { LayoutDashboard, Users, ClipboardList, CalendarDays, Home, Settings, Download, Upload, RotateCcw, ChevronDown } from 'lucide-react';

type Tab = 'dashboard' | 'members' | 'activities' | 'schedule';

export const FamilyHubApp: React.FC = () => {
  const [state, setState] = useState<AppState>(getInitialState);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Mobile Tab Dropdown Combo State
  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);
  const tabDropdownRef = useRef<HTMLDivElement>(null);

  // Config Dropdown State
  const [configOpen, setConfigOpen] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setConfigOpen(false);
      }
      if (tabDropdownRef.current && !tabDropdownRef.current.contains(event.target as Node)) {
        setTabDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handler for completion toggling bound to dateISO
  const handleToggleCompletion = (
    dateISO: string,
    activityId: string,
    day: DayOfWeek,
    completed: boolean,
    completedBy: string,
    notes?: string
  ) => {
    const key = `${dateISO}_${activityId}`;
    setState((prev) => ({
      ...prev,
      completions: {
        ...prev.completions,
        [key]: {
          completed,
          completedBy,
          completedAt: new Date().toISOString(),
          notes,
        },
      },
    }));
  };

  // Handlers for Members
  const handleAddMember = (memberData: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: `mem-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
  };

  const handleUpdateMember = (updated: FamilyMember) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === updated.id ? updated : m)),
    }));
  };

  const handleDeleteMember = (id: string) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));
  };

  // Handlers for Activities
  const handleAddActivity = (actData: Omit<Activity, 'id' | 'order'>) => {
    const newAct: Activity = {
      ...actData,
      id: `act-${Date.now()}`,
      order: state.activities.length + 1,
    };
    setState((prev) => ({
      ...prev,
      activities: [...prev.activities, newAct],
    }));
  };

  const handleUpdateActivity = (updated: Activity) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.map((a) => (a.id === updated.id ? updated : a)),
    }));
  };

  const handleDeleteActivity = (id: string) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== id),
    }));
  };

  // Move Activity via Drag and Drop
  const handleMoveActivity = (sourceId: string, targetId: string) => {
    setState((prev) => {
      const sorted = [...prev.activities].sort((a, b) => a.order - b.order);
      const sourceIndex = sorted.findIndex((a) => a.id === sourceId);
      const targetIndex = sorted.findIndex((a) => a.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return prev;

      const [movedItem] = sorted.splice(sourceIndex, 1);
      sorted.splice(targetIndex, 0, movedItem);

      // Re-assign order numbers cleanly
      const reordered = sorted.map((act, index) => ({
        ...act,
        order: index + 1,
      }));

      return {
        ...prev,
        activities: reordered,
      };
    });
  };

  // Handler for Schedule Assignments
  const handleUpdateAssignment = (activityId: string, day: DayOfWeek, memberId: string) => {
    setState((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [activityId]: {
          ...(prev.schedule[activityId] || {
            LUNES: '',
            MARTES: '',
            MIERCOLES: '',
            JUEVES: '',
            VIERNES: '',
            SABADO: '',
            DOMINGO: '',
          }),
          [day]: memberId,
        },
      },
    }));
  };

  // Reset to initial image defaults
  const handleResetDefaults = () => {
    if (confirm('¿Deseas restablecer todos los datos a la configuración inicial?')) {
      const fresh = resetToDefaults();
      setState(fresh);
    }
  };

  // Backup & Import
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FamilyHub_Backup_${state.activeWeek}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (dataStr: string) => {
    try {
      const parsed = JSON.parse(dataStr);
      if (parsed.members && parsed.activities && parsed.schedule) {
        setState(parsed);
        alert('¡Datos importados con éxito!');
      } else {
        alert('Archivo JSON inválido.');
      }
    } catch (e) {
      alert('Error al leer el archivo JSON.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        
        {/* ========================================================================= */}
        {/* 1. VISTA MÓVIL / TABLET PEQUEÑA (lg:hidden): Solo Icono Casa + Dropdown Combo Tab + Config */}
        {/* ========================================================================= */}
        <header className="flex lg:hidden items-center justify-between gap-2 mb-4">
          {/* Solo el Icono Morado de la Casa */}
          <div className="p-2.5 rounded-2xl bg-indigo-600 shadow-md text-white shrink-0">
            <Home size={22} />
          </div>

          {/* Menú Combo desplegable de Pestaña Activa + Icono Configuración al lado */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Dropdown Combo Box de Pestañas */}
            <div className="relative flex-1 max-w-[210px]" ref={tabDropdownRef}>
              <button
                type="button"
                onClick={() => setTabDropdownOpen(!tabDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-indigo-600 text-white rounded-full text-xs font-extrabold shadow-sm cursor-pointer border border-indigo-700"
              >
                <div className="flex items-center gap-2 truncate">
                  {activeTab === 'dashboard' && <LayoutDashboard size={15} className="shrink-0" />}
                  {activeTab === 'members' && <Users size={15} className="shrink-0" />}
                  {activeTab === 'activities' && <ClipboardList size={15} className="shrink-0" />}
                  {activeTab === 'schedule' && <CalendarDays size={15} className="shrink-0" />}
                  <span className="truncate">
                    {activeTab === 'dashboard' && 'Semana'}
                    {activeTab === 'members' && `Miembros (${state.members.length})`}
                    {activeTab === 'activities' && `Actividades (${state.activities.length})`}
                    {activeTab === 'schedule' && 'Calendario'}
                  </span>
                </div>
                <ChevronDown size={15} className={`transition-transform text-white/80 shrink-0 ${tabDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Lista Desplegable de Pestañas */}
              {tabDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('dashboard'); setTabDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer ${
                      activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard size={15} />
                    <span>Semana</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('members'); setTabDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer ${
                      activeTab === 'members' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Users size={15} />
                    <span>Miembros ({state.members.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('activities'); setTabDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer ${
                      activeTab === 'activities' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ClipboardList size={15} />
                    <span>Actividades ({state.activities.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('schedule'); setTabDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer ${
                      activeTab === 'schedule' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <CalendarDays size={15} />
                    <span>Calendario</span>
                  </button>
                </div>
              )}
            </div>

            {/* Icono de Configuración al lado */}
            <div className="relative" ref={configRef}>
              <button
                type="button"
                onClick={() => setConfigOpen(!configOpen)}
                className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                  configOpen
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-300/80 hover:bg-slate-300 border-slate-300 text-slate-700 hover:text-slate-950'
                }`}
                title="Configuración"
              >
                <Settings size={18} />
              </button>

              {configOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Opciones y Copia de Seguridad
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setConfigOpen(false);
                      handleExportJSON();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Download size={16} className="text-indigo-600" />
                    <span>Exportar Backup (JSON)</span>
                  </button>

                  <label className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer">
                    <Upload size={16} className="text-emerald-600" />
                    <span>Importar Backup (JSON)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const text = evt.target?.result as string;
                            handleImportJSON(text);
                          };
                          reader.readAsText(file);
                        }
                        setConfigOpen(false);
                      }}
                      className="hidden"
                    />
                  </label>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setConfigOpen(false);
                      handleResetDefaults();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    <span>Restablecer Plan Inicial</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. VISTA ESCRITORIO (hidden lg:flex): Título + Insignia en 1 sola fila */}
        {/* ========================================================================= */}
        <header className="hidden lg:flex flex-row items-center justify-between gap-4 mb-5 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 shadow-sm text-white shrink-0">
              <Home size={20} />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                FamilyHub
              </h1>
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-full font-black uppercase shadow-xs">
                Plan Limpieza Hogar
              </span>
            </div>
          </div>

          {/* Tab Navigation Controls + Menú Configuración */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1.5 bg-slate-300/80 p-1 rounded-full border border-slate-300 shadow-inner overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300'
                }`}
              >
                <LayoutDashboard size={14} />
                <span>Semana</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'members'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300'
                }`}
              >
                <Users size={14} />
                <span>Miembros ({state.members.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'activities'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300'
                }`}
              >
                <ClipboardList size={14} />
                <span>Actividades ({state.activities.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'schedule'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300'
                }`}
              >
                <CalendarDays size={14} />
                <span>Calendario</span>
              </button>
            </nav>

            {/* Menú Desplegable Configuración (Reiniciar & Backup) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setConfigOpen(!configOpen)}
                className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                  configOpen
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-300/80 hover:bg-slate-300 border-slate-300 text-slate-700 hover:text-slate-950'
                }`}
                title="Configuración y Opciones"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main>
          {activeTab === 'dashboard' && (
            <DashboardTable
              activities={state.activities}
              members={state.members}
              schedule={state.schedule}
              completions={state.completions}
              activeWeekMondayISO={state.activeWeek}
              onSelectMondayISO={(newMondayISO) => setState((prev) => ({ ...prev, activeWeek: newMondayISO }))}
              onToggleCompletion={handleToggleCompletion}
            />
          )}

          {activeTab === 'members' && (
            <MemberManager
              members={state.members}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {activeTab === 'activities' && (
            <ActivityManager
              activities={state.activities}
              onAddActivity={handleAddActivity}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleManager
              activities={state.activities}
              members={state.members}
              schedule={state.schedule}
              onUpdateAssignment={handleUpdateAssignment}
              onMoveActivity={handleMoveActivity}
            />
          )}
        </main>
      </div>
    </div>
  );
};
