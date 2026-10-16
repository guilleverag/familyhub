import React, { useState, useEffect, useRef } from 'react';
import type {
  AppState,
  FamilyMember,
  Activity,
  ScheduleMap,
  DayOfWeek,
  AccountsState,
  ExpenseRecord,
} from '../types';
import {
  getInitialState,
  saveState,
  resetToDefaults,
  getInitialAccountsState,
  saveAccountsState,
} from '../utils/storage';
import { DashboardTable } from './DashboardTable';
import { MemberManager } from './MemberManager';
import { ActivityManager } from './ActivityManager';
import { ScheduleManager } from './ScheduleManager';
import { AccountsManager } from './AccountsManager';
import { NavigationDrawer, type AppModule } from './NavigationDrawer';
import { PlaceholderModule } from './PlaceholderModule';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarDays,
  Home,
  Settings,
  Download,
  Upload,
  RotateCcw,
  ChevronDown,
  Cloud,
  RefreshCw,
  Menu,
  Sparkles,
} from 'lucide-react';

type Tab = 'dashboard' | 'members' | 'activities' | 'schedule';

export const FamilyHubApp: React.FC = () => {
  const [state, setState] = useState<AppState>(getInitialState);
  const [accountsState, setAccountsState] = useState<AccountsState>(getInitialAccountsState);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoadingDB, setIsLoadingDB] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  // Multi-module Navigation State ('cleaning' | 'calendar' | 'accounts')
  const [activeModule, setActiveModule] = useState<AppModule>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('familyhub_active_module');
      if (saved === 'cleaning' || saved === 'calendar' || saved === 'accounts') {
        return saved as AppModule;
      }
    }
    return 'cleaning';
  });

  // Drawer Menu State
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('familyhub_active_module', activeModule);
    }
  }, [activeModule]);

  // Mobile Tab Dropdown Combo State
  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);
  const tabDropdownRef = useRef<HTMLDivElement>(null);

  // Config Dropdown State
  const [configOpen, setConfigOpen] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);

  // Initial Load from Cloudflare D1
  useEffect(() => {
    fetchAllDBState();
  }, []);

  // Save to localStorage as secondary backup
  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    saveAccountsState(accountsState);
  }, [accountsState]);

  const fetchAllDBState = async () => {
    setIsLoadingDB(true);
    await Promise.all([fetchCleaningDBState(), fetchAccountsDBState()]);
    setIsLoadingDB(false);
  };

  const fetchCleaningDBState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data.members && data.activities && data.schedule && data.completions) {
          setState((prev) => ({
            ...prev,
            members: data.members,
            activities: data.activities,
            schedule: data.schedule,
            completions: data.completions,
          }));
          setSyncStatus('synced');
        }
      }
    } catch (err) {
      console.warn('Could not fetch cleaning state from D1, using local state:', err);
    }
  };

  const fetchAccountsDBState = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        if (data.expenses) {
          setAccountsState((prev) => ({
            ...prev,
            expenses: data.expenses,
            activeMonth: data.activeMonth || prev.activeMonth,
            customBudgets: data.customBudgets || prev.customBudgets,
          }));
          setSyncStatus('synced');
        }
      }
    } catch (err) {
      console.warn('Could not fetch accounts state from D1, using local state:', err);
    }
  };

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

  // ==========================================
  // Cleaning Plan Handlers
  // ==========================================
  const handleToggleCompletion = async (
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

    try {
      setSyncStatus('syncing');
      await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateISO, activityId, dayOfWeek: day, completed, completedBy, notes }),
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync completion with D1:', err);
      setSyncStatus('error');
    }
  };

  const handleAddMember = async (memberData: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: `mem-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));

    try {
      setSyncStatus('syncing');
      await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const handleUpdateMember = async (updated: FamilyMember) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === updated.id ? updated : m)),
    }));

    try {
      setSyncStatus('syncing');
      await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const handleDeleteMember = async (id: string) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));

    try {
      setSyncStatus('syncing');
      await fetch('/api/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const handleAddActivity = async (actData: Omit<Activity, 'id' | 'order'>) => {
    const newAct: Activity = {
      ...actData,
      id: `act-${Date.now()}`,
      order: state.activities.length + 1,
    };
    setState((prev) => ({
      ...prev,
      activities: [...prev.activities, newAct],
    }));

    try {
      setSyncStatus('syncing');
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAct),
      });
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const handleUpdateActivity = async (updated: Activity) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.map((a) => (a.id === updated.id ? updated : a)),
    }));

    try {
      setSyncStatus('syncing');
      await fetch('/api/activities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== id),
    }));

    try {
      setSyncStatus('syncing');
      await fetch('/api/activities', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const handleMoveActivity = async (sourceId: string, targetId: string) => {
    const sorted = [...state.activities].sort((a, b) => a.order - b.order);
    const sourceIndex = sorted.findIndex((a) => a.id === sourceId);
    const targetIndex = sorted.findIndex((a) => a.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

    const [movedItem] = sorted.splice(sourceIndex, 1);
    sorted.splice(targetIndex, 0, movedItem);

    const reordered = sorted.map((act, index) => ({
      ...act,
      order: index + 1,
    }));

    setState((prev) => ({
      ...prev,
      activities: reordered,
    }));

    try {
      setSyncStatus('syncing');
      await fetch('/api/activities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered),
      });
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const handleUpdateAssignment = async (activityId: string, day: DayOfWeek, memberId: string) => {
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

    try {
      setSyncStatus('syncing');
      await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, dayOfWeek: day, memberId }),
      });
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('¿Deseas restablecer todos los datos del plan de limpieza a la configuración inicial?')) {
      const fresh = resetToDefaults();
      setState(fresh);
    }
  };

  const handleExportJSON = () => {
    const dataToExport = {
      cleaning: state,
      accounts: accountsState,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
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
      if (parsed.cleaning) {
        setState(parsed.cleaning);
        if (parsed.accounts) setAccountsState(parsed.accounts);
        alert('¡Datos completos importados con éxito!');
      } else if (parsed.members && parsed.activities && parsed.schedule) {
        setState(parsed);
        alert('¡Datos de limpieza importados con éxito!');
      } else {
        alert('Archivo JSON inválido.');
      }
    } catch (e) {
      alert('Error al leer el archivo JSON.');
    }
  };

  // ==========================================
  // Cuentas Hogar Handlers
  // ==========================================
  const handleAddExpense = async (expenseData: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setAccountsState((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));

    try {
      setSyncStatus('syncing');
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_expense',
          expense: newExpense,
        }),
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync expense with D1:', err);
      setSyncStatus('error');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setAccountsState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));

    try {
      setSyncStatus('syncing');
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_expense',
          id,
        }),
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to delete expense from D1:', err);
      setSyncStatus('error');
    }
  };

  const handleSetActiveMonth = async (monthKey: string) => {
    setAccountsState((prev) => ({
      ...prev,
      activeMonth: monthKey,
    }));

    try {
      setSyncStatus('syncing');
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_active_month',
          monthKey,
        }),
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to set active month in D1:', err);
      setSyncStatus('error');
    }
  };

  const getModuleTitle = (mod: AppModule) => {
    switch (mod) {
      case 'cleaning':
        return 'Plan Limpieza Hogar';
      case 'calendar':
        return 'Calendario Hogar';
      case 'accounts':
        return 'Cuentas Hogar';
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        
        {/* ========================================================================= */}
        {/* 1. VISTA MÓVIL / TABLET PEQUEÑA (lg:hidden): Menú Hamburguesa + Controles */}
        {/* ========================================================================= */}
        <header className="flex lg:hidden items-center justify-between gap-2 mb-4">
          {/* Botón Menú Hamburguesa + Indicador D1 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md text-white shrink-0 flex items-center justify-center cursor-pointer transition-all"
              title="Abrir menú de módulos"
              aria-label="Abrir menú de módulos"
            >
              <Menu size={22} />
            </button>

            {/* Insignia Cloudflare D1 Sync (Solo Icono) */}
            <div
              className={`p-1.5 rounded-full border transition-all flex items-center justify-center ${
                syncStatus === 'syncing'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : syncStatus === 'error'
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}
              title={
                syncStatus === 'syncing'
                  ? 'Guardando en Cloudflare D1...'
                  : syncStatus === 'error'
                  ? 'Error de sincronización con Cloudflare D1'
                  : 'Conectado a Cloudflare D1 (Sincronizado)'
              }
            >
              <Cloud size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            </div>

            {/* Nombre del módulo si no es el principal */}
            {activeModule !== 'cleaning' && (
              <span className="text-xs font-black text-slate-800 truncate max-w-[140px]">
                {getModuleTitle(activeModule)}
              </span>
            )}
          </div>

          {/* Menú Combo desplegable de Pestaña Activa + Icono Configuración al lado (Solo en Módulo Limpieza) */}
          {activeModule === 'cleaning' ? (
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
                  <div className="absolute right-0 mt-1.5 w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in duration-150">
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
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 z-40 animate-in fade-in duration-150">
                    <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Opciones y Backup</span>
                      <button
                        type="button"
                        onClick={fetchAllDBState}
                        className="text-indigo-600 hover:underline flex items-center gap-1 normal-case font-bold"
                      >
                        <RefreshCw size={12} /> Sync D1
                      </button>
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
          ) : (
            /* Botón rápido para volver al Plan de Limpieza en Móvil */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveModule('cleaning')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles size={14} />
                <span>Plan Limpieza</span>
              </button>
            </div>
          )}
        </header>

        {/* ========================================================================= */}
        {/* 2. VISTA ESCRITORIO (hidden lg:flex): Menú + Título + Módulo + Controles */}
        {/* ========================================================================= */}
        <header className="hidden lg:flex flex-row items-center justify-between gap-4 mb-5 pb-1">
          <div className="flex items-center gap-2.5">
            {/* Botón Menú Hamburguesa de Escritorio */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="p-2 px-3 rounded-xl bg-slate-300/80 hover:bg-slate-300 text-slate-800 transition-colors flex items-center gap-1.5 font-bold text-xs cursor-pointer shadow-xs border border-slate-300"
              title="Abrir menú de módulos"
            >
              <Menu size={17} />
              <span className="font-extrabold text-[11px] uppercase tracking-wider">Menú</span>
            </button>

            <div className="p-2 rounded-xl bg-indigo-600 shadow-sm text-white shrink-0">
              <Home size={20} />
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                FamilyHub
              </h1>

              {/* Badge interactivo del Módulo Actual (abre el menú al hacer clic) */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 px-2.5 py-0.5 rounded-full font-black uppercase shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                title="Cambiar módulo"
              >
                <span>{getModuleTitle(activeModule)}</span>
                <ChevronDown size={12} className="opacity-70" />
              </button>

              {/* Cloudflare D1 Live Cloud Status (Solo Icono en Desktop) */}
              <div
                className={`p-1.5 rounded-full border transition-all flex items-center justify-center ${
                  syncStatus === 'syncing'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : syncStatus === 'error'
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}
                title={
                  syncStatus === 'syncing'
                    ? 'Guardando en Cloudflare D1...'
                    : syncStatus === 'error'
                    ? 'Error de sincronización con Cloudflare D1'
                    : 'Conectado a Cloudflare D1 (Sincronizado)'
                }
              >
                <Cloud size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
              </div>
            </div>
          </div>

          {/* Tab Navigation Controls (Solo en Módulo de Limpieza) */}
          {activeModule === 'cleaning' ? (
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
              <div className="relative" ref={configRef}>
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

                {configOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 z-40 animate-in fade-in duration-150">
                    <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Opciones y Backup</span>
                      <button
                        type="button"
                        onClick={fetchAllDBState}
                        className="text-indigo-600 hover:underline flex items-center gap-1 normal-case font-bold"
                      >
                        <RefreshCw size={12} /> Sync D1
                      </button>
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
          ) : (
            /* Botón para volver a Plan Limpieza en Escritorio */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveModule('cleaning')}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <Sparkles size={14} />
                <span>Volver a Plan Limpieza (Principal)</span>
              </button>
            </div>
          )}
        </header>

        {/* Dynamic Body Content según el Módulo Seleccionado */}
        <main>
          {activeModule === 'cleaning' && (
            <>
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
            </>
          )}

          {activeModule === 'accounts' && (
            <AccountsManager
              expenses={accountsState.expenses}
              activeMonth={accountsState.activeMonth}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onSetActiveMonth={handleSetActiveMonth}
            />
          )}

          {activeModule === 'calendar' && (
            <PlaceholderModule
              module="calendar"
              onBackToCleaning={() => setActiveModule('cleaning')}
              onOpenMenu={() => setDrawerOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Menú Lateral Deslizable (Navigation Drawer) */}
      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        syncStatus={syncStatus}
      />
    </div>
  );
};
