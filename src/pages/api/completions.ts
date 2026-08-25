import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

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
  try {
    const db = getDB(context);

    if (!db) {
      return new Response(JSON.stringify({ error: 'DB binding missing' }), { status: 500 });
    }

    const body = await context.request.json();
    const { dateISO, activityId, dayOfWeek, completed, completedBy, notes } = body;

    if (!dateISO || !activityId) {
      return new Response(JSON.stringify({ error: 'Missing dateISO or activityId' }), { status: 400 });
    }

    if (completed) {
      const completedAt = new Date().toISOString();
      await db
        .prepare(
          `INSERT INTO completions (dateISO, activityId, dayOfWeek, completed, completedBy, completedAt, notes)
           VALUES (?, ?, ?, 1, ?, ?, ?)
           ON CONFLICT(dateISO, activityId) DO UPDATE SET
             completed = 1,
             completedBy = excluded.completedBy,
             completedAt = excluded.completedAt,
             notes = excluded.notes`
        )
        .bind(dateISO, activityId, dayOfWeek || '', completedBy || '', completedAt, notes || '')
        .run();
    } else {
      await db
        .prepare(`DELETE FROM completions WHERE dateISO = ? AND activityId = ?`)
        .bind(dateISO, activityId)
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
