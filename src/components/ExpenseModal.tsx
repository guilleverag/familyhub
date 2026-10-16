import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Beef,
  Carrot,
  ShoppingBag,
  Ham,
  Bus,
  PawPrint,
  Check,
} from 'lucide-react';
import {
  type ExpenseCategory,
  EXPENSE_CATEGORIES,
} from '../types';
import { formatCurrency } from '../utils/accounts';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    category: ExpenseCategory;
    amount: number;
    dateISO: string;
    description?: string;
  }) => void;
  initialCategory?: ExpenseCategory;
  defaultDateISO?: string;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Beef,
  Carrot,
  ShoppingBag,
  Ham,
  Bus,
  PawPrint,
};

import { getBogotaTodayISO } from '../utils/dates';

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCategory = 'Mercado',
  defaultDateISO,
}) => {
  const getTodayISO = () => getBogotaTodayISO();

  const [category, setCategory] = useState<ExpenseCategory>(initialCategory);
  const [amountStr, setAmountStr] = useState<string>('');
  const [dateISO, setDateISO] = useState<string>(defaultDateISO || getTodayISO());
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
      setAmountStr('');
      setDateISO(defaultDateISO || getTodayISO());
      setDescription('');
      setError('');
    }
  }, [isOpen, initialCategory, defaultDateISO]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const clean = e.target.value.replace(/\D/g, '');
    setAmountStr(clean);
    if (error) setError('');
  };

  const handleAddQuickAmount = (val: number) => {
    const current = parseInt(amountStr || '0', 10);
    const next = current + val;
    setAmountStr(String(next));
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr || '0', 10);

    if (!amount || amount <= 0) {
      setError('Por favor escribe un monto válido mayor a 0.');
      return;
    }

    if (!dateISO) {
      setError('Por favor selecciona una fecha.');
      return;
    }

    onSave({
      category,
      amount,
      dateISO,
      description: description.trim() || undefined,
    });

    onClose();
  };

  const selectedConfig = EXPENSE_CATEGORIES.find((c) => c.id === category) || EXPENSE_CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xs">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Registrar Gasto
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Agrega una compra o gasto a Cuentas Hogar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in">
              {error}
            </div>
          )}

          {/* 1. Categoría */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag size={14} className="text-slate-400" />
              Tipo de Gasto
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.iconName] || ShoppingBag;
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-500/30'
                        : 'border-slate-200/90 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="p-1.5 rounded-xl text-white shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <Icon size={16} />
                      </div>
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-indigo-600 text-white">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block truncate">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block">
                        Presup: ${formatCurrency(cat.defaultBudget)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Monto */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign size={14} className="text-slate-400" />
              Monto del Gasto
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr ? formatCurrency(parseInt(amountStr, 10)) : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border-2 border-slate-200 focus:border-indigo-600 rounded-2xl text-xl font-black text-slate-900 focus:outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Quick helper amount pills */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tight mr-1">
                Sumar:
              </span>
              {[5000, 10000, 20000, 50000, 100000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddQuickAmount(val)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-extrabold cursor-pointer transition-colors border border-slate-200/80 active:scale-95"
                >
                  +{formatCurrency(val)}
                </button>
              ))}
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-extrabold cursor-pointer transition-colors border border-rose-200 active:scale-95 ml-auto"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* 3. Fecha */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              Fecha del Gasto
            </label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-xs font-extrabold text-slate-800 focus:outline-none transition-all cursor-pointer"
            />
          </div>

          {/* 4. Detalle / Descripción (Opcional) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText size={14} className="text-slate-400" />
              Detalle / Nota <span className="text-slate-400 font-semibold lowercase">(opcional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Carne de res y pollo, Feria verduras, Gasolina..."
              maxLength={80}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Guardar Gasto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
