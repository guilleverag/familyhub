import {
  type ExpenseCategory,
  type ExpenseCategoryConfig,
  type ExpenseRecord,
  EXPENSE_CATEGORIES,
} from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

import { getBogotaTodayISO } from './dates';

export function formatCurrencyWithSymbol(amount: number): string {
  return `$ ${formatCurrency(amount)}`;
}

export function getMonthKey(date: Date | string = new Date()): string {
  if (typeof date === 'string') {
    return date.slice(0, 7);
  }
  const iso = getBogotaTodayISO(date);
  return iso.slice(0, 7);
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function formatMonthName(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const year = yearStr;
  const name = MONTH_NAMES[monthIdx] || monthStr;
  return `${name} ${year}`;
}

export function getNextMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  month++;
  if (month > 12) {
    month = 1;
    year++;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getPrevMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  month--;
  if (month < 1) {
    month = 12;
    year--;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getCategoryConfig(categoryId: ExpenseCategory): ExpenseCategoryConfig {
  const found = EXPENSE_CATEGORIES.find((c) => c.id === categoryId);
  if (found) return found;
  return EXPENSE_CATEGORIES[0];
}

export interface CategorySummary {
  config: ExpenseCategoryConfig;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  isExceeded: boolean;
  exceededAmount: number;
  expenseCount: number;
}

export interface MonthSummary {
  categories: Record<ExpenseCategory, CategorySummary>;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  totalPercentage: number;
  isTotalExceeded: boolean;
  totalExpensesCount: number;
}

export function calculateMonthSummary(
  expenses: ExpenseRecord[],
  monthKey: string,
  customBudgets?: Record<string, number>
): MonthSummary {
  const monthExpenses = expenses.filter((e) => e.monthKey === monthKey);

  let totalBudget = 0;
  let totalSpent = 0;
  const categoriesRecord: Partial<Record<ExpenseCategory, CategorySummary>> = {};

  EXPENSE_CATEGORIES.forEach((cat) => {
    const budgetKey = `${monthKey}_${cat.id}`;
    const budget = customBudgets && customBudgets[budgetKey] !== undefined
      ? customBudgets[budgetKey]
      : cat.defaultBudget;

    const catExpenses = monthExpenses.filter((e) => e.category === cat.id);
    const spent = catExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const remaining = budget - spent;
    const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    const isExceeded = spent > budget;
    const exceededAmount = isExceeded ? spent - budget : 0;

    totalBudget += budget;
    totalSpent += spent;

    categoriesRecord[cat.id] = {
      config: cat,
      budget,
      spent,
      remaining,
      percentage,
      isExceeded,
      exceededAmount,
      expenseCount: catExpenses.length,
    };
  });

  const totalRemaining = totalBudget - totalSpent;
  const totalPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const isTotalExceeded = totalSpent > totalBudget;

  return {
    categories: categoriesRecord as Record<ExpenseCategory, CategorySummary>,
    totalBudget,
    totalSpent,
    totalRemaining,
    totalPercentage,
    isTotalExceeded,
    totalExpensesCount: monthExpenses.length,
  };
}
