import React, { useEffect } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Wallet,
  Home,
  Cloud,
  ChevronRight,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export type AppModule = 'cleaning' | 'calendar' | 'accounts';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  syncStatus: 'synced' | 'syncing' | 'error';
}

interface ModuleItem {
  id: AppModule;
  title: string;
  shortDesc: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  isAvailable: boolean;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeModule,
  onSelectModule,
  syncStatus,
}) => {
  // Close with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const modules: ModuleItem[] = [
    {
      id: 'cleaning',
      title: 'Plan Limpieza Hogar',
      shortDesc: 'Matriz semanal de tareas y responsables',
      badge: 'Principal',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Sparkles,
      iconBg: 'bg-indigo-600',
      iconColor: 'text-white',
      isAvailable: true,
    },
    {
      id: 'calendar',
      title: 'Calendario Hogar',
      shortDesc: 'Eventos, citas escolares y recordatorios',
      badge: 'Próximamente',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: Calendar,
      iconBg: 'bg-sky-500',
      iconColor: 'text-white',
      isAvailable: false,
    },
    {
      id: 'accounts',
      title: 'Cuentas Hogar',
      shortDesc: 'Gastos familiares, rubros y presupuesto',
      badge: 'Activo',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Wallet,
      iconBg: 'bg-emerald-600',
      iconColor: 'text-white',
      isAvailable: true,
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transition-visibility duration-300 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 w-84 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/90 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 shadow-md text-white flex items-center justify-center">
              <Home size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-black tracking-tight text-slate-900">FamilyHub</h2>
                <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.2 rounded-md">
                  v2.0
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">Gestión Integral del Hogar</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="px-2 pt-1 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} />
              Módulos del Hogar
            </span>
            <span className="text-[10px] font-bold text-slate-400">3 Ventanas</span>
          </div>

          {modules.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectModule(item.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group relative ${
                  isActive
                    ? 'bg-indigo-50/90 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Icon box */}
                <div
                  className={`p-2.5 rounded-xl shadow-xs shrink-0 flex items-center justify-center text-white ${item.iconBg}`}
                >
                  <Icon size={18} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs font-black truncate ${
                        isActive ? 'text-indigo-950' : 'text-slate-800 group-hover:text-slate-950'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase tracking-tight px-1.5 py-0.2 rounded-md border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5 leading-snug">
                    {item.shortDesc}
                  </p>
                </div>

                {/* Right Arrow / Active Indicator */}
                <div className="shrink-0 self-center">
                  {isActive ? (
                    <div className="w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                  ) : (
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/90 bg-slate-50/70 space-y-3">
          {/* Cloud Status */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-full border flex items-center justify-center ${
                  syncStatus === 'syncing'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : syncStatus === 'error'
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}
              >
                <Cloud size={13} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
              </div>
              <span className="text-[11px]">Cloudflare D1</span>
            </div>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                syncStatus === 'syncing'
                  ? 'bg-amber-100 text-amber-800'
                  : syncStatus === 'error'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {syncStatus === 'syncing' ? 'Sincronizando' : syncStatus === 'error' ? 'Error' : 'Conectado'}
            </span>
          </div>

          <p className="text-[10px] text-center text-slate-400 font-semibold">
            FamilyHub • Sincronización Multi-dispositivo
          </p>
        </div>
      </aside>
    </div>
  );
};
