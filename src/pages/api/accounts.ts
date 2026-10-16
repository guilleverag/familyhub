import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import type { ExpenseRecord } from '../../types';

const PROD_URL = 'https://familyhub.guillermoveraghanain.workers.dev';

async function proxyToProd(context: any) {
  const target = new URL(context.url.pathname + context.url.search, PROD_URL);
  const method = context.request.method;
  const body = method !== 'GET' && method !== 'HEAD' ? await context.request.text() : undefined;

  const res = await fetch(target.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

function getDB(context: any) {
  try {
    if ((env as any)?.DB) return (env as any).DB;
  } catch (e) {}

  return (
    (context.locals as any)?.env?.DB ||
    (context as any).env?.DB ||
    (globalThis as any)?.DB
  );
}

let tablesChecked = false;

async function ensureAccountsTables(db: any) {
  if (tablesChecked) return;
  try {
    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS accounts_expenses (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          amount REAL NOT NULL,
          dateISO TEXT NOT NULL,
          monthKey TEXT NOT NULL,
          description TEXT,
          createdAt TEXT NOT NULL
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS accounts_budgets (
          category TEXT NOT NULL,
          monthKey TEXT NOT NULL,
          amount REAL NOT NULL,
          PRIMARY KEY (category, monthKey)
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS accounts_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `),
    ]);
    tablesChecked = true;
  } catch (err) {
    console.warn('Notice ensuring accounts tables:', err);
  }
}

export const GET: APIRoute = async (context) => {
  // En modo desarrollo local, conectarse directamente a la BD de Cloudflare en producción
  if (import.meta.env.DEV) {
    return proxyToProd(context);
  }

  try {
    const db = getDB(context);

    if (!db) {
      return new Response(JSON.stringify({ error: 'DB binding missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await ensureAccountsTables(db);

    // 1. Obtener Gastos
    const expensesRes = await db
      .prepare('SELECT id, category, amount, dateISO, monthKey, description, createdAt FROM accounts_expenses ORDER BY dateISO DESC, createdAt DESC')
      .all();

    const expenses: ExpenseRecord[] = (expensesRes.results || []).map((row: any) => ({
      id: row.id,
      category: row.category,
      amount: Number(row.amount) || 0,
      dateISO: row.dateISO,
      monthKey: row.monthKey,
      description: row.description || '',
      createdAt: row.createdAt,
    }));

    // 2. Obtener Configuración (ej. Mes Activo)
    const settingsRes = await db.prepare('SELECT key, value FROM accounts_settings').all();
    const settingsMap: Record<string, string> = {};
    (settingsRes.results || []).forEach((row: any) => {
      settingsMap[row.key] = row.value;
    });

    // 3. Obtener Presupuestos personalizados
    const budgetsRes = await db.prepare('SELECT category, monthKey, amount FROM accounts_budgets').all();
    const customBudgets: Record<string, number> = {};
    (budgetsRes.results || []).forEach((row: any) => {
      customBudgets[`${row.monthKey}_${row.category}`] = Number(row.amount) || 0;
    });

    return new Response(
      JSON.stringify({
        expenses,
        activeMonth: settingsMap['active_month'] || null,
        customBudgets,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async (context) => {
  // En modo desarrollo local, enviar la mutación directamente a la BD de Cloudflare en producción
  if (import.meta.env.DEV) {
    return proxyToProd(context);
  }

  try {
    const db = getDB(context);

    if (!db) {
      return new Response(JSON.stringify({ error: 'DB binding missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await ensureAccountsTables(db);

    const body = await context.request.json();
    const { action } = body;

    if (action === 'add_expense') {
      const { expense } = body;
      if (!expense || !expense.id || !expense.category || expense.amount === undefined || !expense.dateISO) {
        return new Response(JSON.stringify({ error: 'Missing required expense fields' }), { status: 400 });
      }

      const monthKey = expense.monthKey || expense.dateISO.slice(0, 7);
      const createdAt = expense.createdAt || new Date().toISOString();

      await db
        .prepare(`
          INSERT INTO accounts_expenses (id, category, amount, dateISO, monthKey, description, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            category = excluded.category,
            amount = excluded.amount,
            dateISO = excluded.dateISO,
            monthKey = excluded.monthKey,
            description = excluded.description
        `)
        .bind(
          expense.id,
          expense.category,
          Number(expense.amount),
          expense.dateISO,
          monthKey,
          expense.description || '',
          createdAt
        )
        .run();

      return new Response(JSON.stringify({ success: true, id: expense.id }), { status: 200 });
    }

    if (action === 'delete_expense') {
      const { id } = body;
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing expense id' }), { status: 400 });
      }

      await db.prepare('DELETE FROM accounts_expenses WHERE id = ?').bind(id).run();
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (action === 'set_active_month') {
      const { monthKey } = body;
      if (!monthKey) {
        return new Response(JSON.stringify({ error: 'Missing monthKey' }), { status: 400 });
      }

      await db
        .prepare(`
          INSERT INTO accounts_settings (key, value) VALUES ('active_month', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `)
        .bind(monthKey)
        .run();

      return new Response(JSON.stringify({ success: true, activeMonth: monthKey }), { status: 200 });
    }

    if (action === 'set_budget') {
      const { category, monthKey, amount } = body;
      if (!category || !monthKey || amount === undefined) {
        return new Response(JSON.stringify({ error: 'Missing required budget fields' }), { status: 400 });
      }

      await db
        .prepare(`
          INSERT INTO accounts_budgets (category, monthKey, amount) VALUES (?, ?, ?)
          ON CONFLICT(category, monthKey) DO UPDATE SET amount = excluded.amount
        `)
        .bind(category, monthKey, Number(amount))
        .run();

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
