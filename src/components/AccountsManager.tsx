import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Wallet,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Filter,
  Beef,
  Carrot,
  ShoppingBag,
  Ham,
  Bus,
  PawPrint,
  Clock,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  type ExpenseCategory,
  type ExpenseRecord,
  EXPENSE_CATEGORIES,
} from '../types';
import {
  formatCurrency,
  formatCurrencyWithSymbol,
  formatMonthName,
  getNextMonthKey,
  getPrevMonthKey,
  calculateMonthSummary,
} from '../utils/accounts';
import { ExpenseModal } from './ExpenseModal';
import { getBogotaTodayISO } from '../utils/dates';

interface AccountsManagerProps {
  expenses: ExpenseRecord[];
  activeMonth: string; // The canonical active month stored in D1
  onAddExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
  onSetActiveMonth: (monthKey: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Beef,
  Carrot,
  ShoppingBag,
  Ham,
  Bus,
  PawPrint,
};

export const AccountsManager: React.FC<AccountsManagerProps> = ({
  expenses,
  activeMonth,
  onAddExpense,
  onDeleteExpense,
  onSetActiveMonth,
}) => {
  // Current month being viewed in the UI (can browse previous/future months)
  const [viewedMonth, setViewedMonth] = useState<string>(activeMonth);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalInitialCategory, setModalInitialCategory] = useState<ExpenseCategory>('Mercado');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'TODOS'>('TODOS');

  // Sync viewedMonth when activeMonth arrives from D1
  React.useEffect(() => {
    if (activeMonth) {
      setViewedMonth(activeMonth);
    }
  }, [activeMonth]);

  // Today ISO in Colombia (Bogota) timezone
  const todayISO = getBogotaTodayISO();
  const calendarCurrentMonthKey = todayISO.slice(0, 7);

  // Calculate summary for the viewed month
  const summary = calculateMonthSummary(expenses, viewedMonth);

  // Filtered expenses list for viewed month
  const monthExpenses = expenses
    .filter((e) => e.monthKey === viewedMonth)
    .filter((e) => (categoryFilter === 'TODOS' ? true : e.category === categoryFilter))
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO) || b.createdAt.localeCompare(a.createdAt));

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewedMonth((prev) => getPrevMonthKey(prev));
  };

  const handleNextMonth = () => {
    setViewedMonth((prev) => getNextMonthKey(prev));
  };

  const handleAdvanceToNextMonth = () => {
    const nextMonth = getNextMonthKey(viewedMonth);
    const nextName = formatMonthName(nextMonth);
    const ok = confirm(
      `¿Deseas iniciar el nuevo ciclo para ${nextName}?\n\n` +
      `Se establecerá como el mes activo para todos los dispositivos y comenzará con $0 gastados en cada rubro. ` +
      `Siempre podrás consultar los meses anteriores en cualquier momento.`
    );
    if (ok) {
      setViewedMonth(nextMonth);
      onSetActiveMonth(nextMonth);
    }
  };

  const handleOpenAddModal = (cat?: ExpenseCategory) => {
    setModalInitialCategory(cat || 'Mercado');
    setModalOpen(true);
  };

  const handleSaveExpense = (data: {
    category: ExpenseCategory;
    amount: number;
    dateISO: string;
    description?: string;
  }) => {
    const monthKey = data.dateISO.slice(0, 7);
    onAddExpense({
      category: data.category,
      amount: data.amount,
      dateISO: data.dateISO,
      monthKey,
      description: data.description,
    });
  };

  const handleDeleteClick = (id: string, desc: string, amount: number) => {
    const ok = confirm(`¿Eliminar este gasto de $${formatCurrency(amount)}${desc ? ` (${desc})` : ''}?`);
    if (ok) {
      onDeleteExpense(id);
    }
  };

  const isViewedActive = viewedMonth === activeMonth;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR: NAVEGACIÓN DE MES & BOTÓN AGREGAR */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-3.5 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Mes Selector & Controles */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          {/* Botón Mes Anterior */}
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 transition-all cursor-pointer border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0"
            title="Mes Anterior"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Nombre del Mes & Indicador de Ciclo */}
          <div className="flex flex-col items-center px-3 sm:px-4 py-1 text-center">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                {formatMonthName(viewedMonth)}
              </span>
              {isViewedActive ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.2 rounded-full font-black uppercase tracking-tight">
                  Mes Activo
                </span>
              ) : (
                <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-300 px-2 py-0.2 rounded-full font-bold uppercase tracking-tight">
                  Histórico
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Presupuesto Mensual: ${formatCurrency(summary.totalBudget)}
            </span>
          </div>

          {/* Botón Mes Siguiente (Navegar) */}
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 transition-all cursor-pointer border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0"
            title="Mes Siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Botones de Acción (Siguiente Mes / Reiniciar Ciclo & + Agregar Gasto) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Botón Siguiente Mes (Reinicio Manual de Ciclo) */}
          <button
            type="button"
            onClick={handleAdvanceToNextMonth}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-extrabold transition-all cursor-pointer border border-slate-300 shadow-2xs flex items-center gap-1.5"
            title="Iniciar nuevo ciclo mensual con $0 gastados"
          >
            <RotateCcw size={14} className="text-slate-500" />
            <span>Siguiente Mes</span>
            <ArrowRight size={13} className="text-slate-400" />
          </button>

          {/* Botón Principal: + Agregar Gasto */}
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="px-4 sm:px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2 shrink-0"
          >
            <Plus size={18} />
            <span>Agregar Gasto</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RESUMEN GLOBAL DEL PRESUPUESTO */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <Wallet size={22} />
            </div>
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                Balance Mensual • {formatMonthName(viewedMonth)}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  ${formatCurrency(summary.totalSpent)}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-400">
                  / ${formatCurrency(summary.totalBudget)}
                </span>
              </div>
            </div>
          </div>

          {/* Pill de cuánto queda o si se excedió */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <div
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                summary.isTotalExceeded
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : summary.totalPercentage > 85
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {summary.isTotalExceeded ? (
                <>
                  <AlertTriangle size={14} />
                  <span>Excedido por ${formatCurrency(Math.abs(summary.totalRemaining))}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Quedan ${formatCurrency(summary.totalRemaining)}</span>
                </>
              )}
            </div>

            <span className="text-xs font-black text-slate-600">
              {summary.totalPercentage}%
            </span>
          </div>
        </div>

        {/* Barra de progreso global */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              summary.isTotalExceeded
                ? 'bg-rose-500'
                : summary.totalPercentage > 85
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(summary.totalPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MATRIZ DE CATEGORÍAS (LAS 6 DEFINIDAS POR EL USUARIO) */}
      {/* ========================================================================= */}
      <div>
        <div className="px-2 mb-3 flex items-center justify-between">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Rubros de Gastos Mensuales
          </span>
          <span className="text-xs font-bold text-slate-400">
            6 Categorías
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {EXPENSE_CATEGORIES.map((cat) => {
            const catSummary = summary.categories[cat.id];
            const Icon = CATEGORY_ICONS[cat.iconName] || ShoppingBag;
            const isExceeded = catSummary.isExceeded;

            return (
              <div
                key={cat.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3 relative overflow-hidden"
              >
                {/* Header Categoría */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2.5 rounded-2xl text-white shadow-2xs shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: cat.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400">
                        Presupuesto: ${formatCurrency(catSummary.budget)}
                      </span>
                    </div>
                  </div>

                  {/* Botón rápido + Gasto para esta categoría */}
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal(cat.id)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 transition-colors cursor-pointer shadow-2xs border border-slate-200"
                    title={`Agregar gasto a ${cat.name}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Monto Gastado vs Presupuesto: 245.000 / 250.000 */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-1 font-black">
                      <span className="text-base sm:text-lg text-slate-900">
                        ${formatCurrency(catSummary.spent)}
                      </span>
                      <span className="text-xs text-slate-400 font-extrabold">
                        / ${formatCurrency(catSummary.budget)}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-500">
                      {catSummary.percentage}%
                    </span>
                  </div>

                  {/* Barra de progreso de la categoría */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : catSummary.percentage > 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(catSummary.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Footer Tarjeta: Cuánto Queda / Excedido */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-400 text-[11px]">
                    {catSummary.expenseCount} {catSummary.expenseCount === 1 ? 'gasto' : 'gastos'}
                  </span>

                  <span
                    className={`font-black text-[11px] px-2.5 py-0.5 rounded-full border ${
                      isExceeded
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : catSummary.percentage > 85
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {isExceeded
                      ? `Excedido: -$${formatCurrency(catSummary.exceededAmount)}`
                      : `Queda: $${formatCurrency(catSummary.remaining)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LISTA Y REGISTRO DE GASTOS DEL MES */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
        {/* Header de la lista de gastos */}
        <div className="p-4 sm:p-5 border-b border-slate-200/90 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Historial de Gastos • {formatMonthName(viewedMonth)}
              </h3>
              <span className="text-xs text-slate-500 font-bold">
                {monthExpenses.length} {monthExpenses.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
          </div>

          {/* Filtro por Categoría */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-300/80 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs w-full sm:w-auto"
            >
              <option value="TODOS">Todos los rubros</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contenido de la lista */}
        {monthExpenses.length === 0 ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Wallet size={26} />
            </div>
            <h4 className="text-sm font-black text-slate-800 mb-1">
              No hay gastos registrados en {formatMonthName(viewedMonth)}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              {categoryFilter !== 'TODOS'
                ? `No hay gastos registrados en el rubro ${categoryFilter}.`
                : 'Empieza a registrar las compras y gastos del hogar para llevar el control automático del presupuesto.'}
            </p>
            <button
              type="button"
              onClick={() => handleOpenAddModal(categoryFilter !== 'TODOS' ? categoryFilter : undefined)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Registrar Primer Gasto</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {monthExpenses.map((exp) => {
              const catConfig = EXPENSE_CATEGORIES.find((c) => c.id === exp.category) || EXPENSE_CATEGORIES[0];
              const Icon = CATEGORY_ICONS[catConfig.iconName] || ShoppingBag;

              return (
                <div
                  key={exp.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                >
                  {/* Izquierda: Icono + Categoría + Detalle + Fecha */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="p-2 rounded-xl text-white shadow-2xs shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: catConfig.color }}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {catConfig.name}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          • {exp.dateISO}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Derecha: Monto + Botón Eliminar */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      ${formatCurrency(exp.amount)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(exp.id, exp.description || catConfig.name, exp.amount)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar gasto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para Registrar Gasto */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveExpense}
        initialCategory={modalInitialCategory}
        defaultDateISO={viewedMonth === calendarCurrentMonthKey ? todayISO : `${viewedMonth}-01`}
      />
    </div>
  );
};
