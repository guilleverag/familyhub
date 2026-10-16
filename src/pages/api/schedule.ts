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

    if (!db) {
      return new Response(JSON.stringify({ error: 'DB binding missing' }), { status: 500 });
    }

    const body = await context.request.json();
    const { activityId, dayOfWeek, memberId } = body;

    if (!activityId || !dayOfWeek) {
      return new Response(JSON.stringify({ error: 'Missing activityId or dayOfWeek' }), { status: 400 });
    }

    if (memberId) {
      await db
        .prepare(
          `INSERT INTO schedule (activityId, dayOfWeek, memberId) VALUES (?, ?, ?)
           ON CONFLICT(activityId, dayOfWeek) DO UPDATE SET memberId = excluded.memberId`
        )
        .bind(activityId, dayOfWeek, memberId)
        .run();
    } else {
      await db
        .prepare(`DELETE FROM schedule WHERE activityId = ? AND dayOfWeek = ?`)
        .bind(activityId, dayOfWeek)
        .run();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
