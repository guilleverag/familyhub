import React from 'react';
import {
  Calendar,
  Wallet,
  ArrowLeft,
  Menu,
  Clock,
  Sparkles,
  CheckCircle2,
  Bell,
  Receipt,
  PiggyBank,
  Users,
} from 'lucide-react';
import type { AppModule } from './NavigationDrawer';

interface PlaceholderModuleProps {
  module: 'calendar' | 'accounts';
  onBackToCleaning: () => void;
  onOpenMenu: () => void;
}

export const PlaceholderModule: React.FC<PlaceholderModuleProps> = ({
  module,
  onBackToCleaning,
  onOpenMenu,
}) => {
  const isCalendar = module === 'calendar';

  const config = isCalendar
    ? {
        title: 'Calendario Hogar',
        badge: 'Próximamente • En Planificación',
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
        icon: Calendar,
        iconBg: 'bg-sky-500',
        ringColor: 'ring-sky-100',
        gradient: 'from-sky-500 to-indigo-600',
        description:
          'El espacio centralizado para coordinar todas las fechas importantes de la familia: eventos escolares, cumpleaños, citas médicas y compromisos en un solo lugar.',
        features: [
          {
            icon: Calendar,
            title: 'Agenda Compartida',
            desc: 'Visualización mensual y semanal de actividades con vista sincronizada para todos los integrantes.',
          },
          {
            icon: Bell,
            title: 'Citas y Colegios',
            desc: 'Horarios de entrada/salida, fechas de evaluaciones y eventos escolares importantes.',
          },
          {
            icon: Users,
            title: 'Asignación Familiar',
            desc: 'Vinculado a los miembros de la familia con sus colores y avatares personalizados.',
          },
        ],
      }
    : {
        title: 'Cuentas Hogar',
        badge: 'Próximamente • En Planificación',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: Wallet,
        iconBg: 'bg-emerald-600',
        ringColor: 'ring-emerald-100',
        gradient: 'from-emerald-500 to-teal-700',
        description:
          'Control inteligente de los gastos y finanzas del hogar: registro de compras, vencimiento de servicios básicos, presupuesto y balances compartidos.',
        features: [
          {
            icon: Receipt,
            title: 'Control de Gastos',
            desc: 'Registro rápido de compras del hogar, supermercado y gastos imprevistos.',
          },
          {
            icon: Clock,
            title: 'Servicios Básicos',
            desc: 'Recordatorio y seguimiento de fechas de corte para agua, luz, gas e internet.',
          },
          {
            icon: PiggyBank,
            title: 'Presupuesto Familiar',
            desc: 'Resumen mensual por categorías y balance de aportes familiares en la nube D1.',
          },
        ],
      };

  const IconComponent = config.icon;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Banner Card Principal */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden text-center">
        {/* Subtle decorative background glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none bg-gradient-to-br ${config.gradient}`}
        />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {/* Main Icon */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl ${config.iconBg} text-white shadow-lg flex items-center justify-center mb-4 ring-8 ${config.ringColor} transition-transform hover:scale-105`}
          >
            <IconComponent size={32} className="sm:w-10 sm:h-10" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${config.badgeColor} flex items-center gap-1.5`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {config.badge}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            {config.title}
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-6">
            {config.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBackToCleaning}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Volver a Plan Limpieza (Principal)</span>
            </button>

            <button
              type="button"
              onClick={onOpenMenu}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200"
            >
              <Menu size={16} />
              <span>Ver Otros Módulos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {config.features.map((feat, idx) => {
          const FeatIcon = feat.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-3.5"
            >
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                <FeatIcon size={18} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight mb-1">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip info box */}
      <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200 text-center">
        <p className="text-xs font-bold text-slate-600">
          💡 Mientras tanto, el módulo <span className="text-indigo-600 font-black">Plan Limpieza Hogar</span> se encuentra 100% activo con sincronización persistente en Cloudflare D1.
        </p>
      </div>
    </div>
  );
};
