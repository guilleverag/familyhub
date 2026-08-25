import type { APIRoute } from 'astro';

function getDB(context: any) {
  return (
    context.locals?.runtime?.env?.DB ||
    context.locals?.env?.DB ||
    context.env?.DB ||
    (globalThis as any).DB
  );
}

export const POST: APIRoute = async (context) => {
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
