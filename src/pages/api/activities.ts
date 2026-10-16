import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

const PROD_URL = 'https://familyhub.guillermoveraghanain.workers.dev';

async function proxyToProd(context: any) {
  const target = new URL(context.url.pathname + context.url.search, PROD_URL);
  const method = context.request.method;
  const body = method !== 'GET' && method !== 'HEAD' ? await context.request.text() : undefined;

  const res = await fetch(target.toString(), {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body,
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
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

export const POST: APIRoute = async (context) => {
  if (import.meta.env.DEV) {
    return proxyToProd(context);
  }

  try {
    const db = getDB(context);
    if (!db) return new Response(JSON.stringify({ error: 'DB binding missing' }), { status: 500 });

    const body = await context.request.json();
    const { id, name, slot, order } = body;

    await db
      .prepare(`INSERT INTO activities (id, name, slot, sortOrder) VALUES (?, ?, ?, ?)`)
      .bind(id, name, slot, order)
      .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async (context) => {
  if (import.meta.env.DEV) {
    return proxyToProd(context);
  }

  try {
    const db = getDB(context);
    if (!db) return new Response(JSON.stringify({ error: 'DB binding missing' }), { status: 500 });

    const body = await context.request.json();
    
    if (Array.isArray(body)) {
      const stmts = body.map((act: any) =>
        db.prepare(`UPDATE activities SET sortOrder = ? WHERE id = ?`).bind(act.order, act.id)
      );
      await db.batch(stmts);
    } else {
      const { id, name, slot, order } = body;
      await db
        .prepare(`UPDATE activities SET name = ?, slot = ?, sortOrder = ? WHERE id = ?`)
        .bind(name, slot, order, id)
        .run();
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async (context) => {
  if (import.meta.env.DEV) {
    return proxyToProd(context);
  }

  try {
    const db = getDB(context);
    if (!db) return new Response(JSON.stringify({ error: 'DB binding missing' }), { status: 500 });

    const body = await context.request.json();
    const { id } = body;

    await db.prepare(`DELETE FROM activities WHERE id = ?`).bind(id).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
