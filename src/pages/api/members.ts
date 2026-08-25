import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  try {
    const runtime = context.locals.runtime as any;
    const db = runtime?.env?.DB;
    if (!db) return new Response(JSON.stringify({ error: 'DB binding missing' }), { status: 500 });

    const body = await context.request.json();
    const { id, name, color, textColor, isSpecial } = body;

    await db
      .prepare(`INSERT INTO members (id, name, color, textColor, isSpecial) VALUES (?, ?, ?, ?, ?)`)
      .bind(id, name, color, textColor, isSpecial ? 1 : 0)
      .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async (context) => {
  try {
    const runtime = context.locals.runtime as any;
    const db = runtime?.env?.DB;
    if (!db) return new Response(JSON.stringify({ error: 'DB binding missing' }), { status: 500 });

    const body = await context.request.json();
    const { id, name, color, textColor, isSpecial } = body;

    await db
      .prepare(`UPDATE members SET name = ?, color = ?, textColor = ?, isSpecial = ? WHERE id = ?`)
      .bind(name, color, textColor, isSpecial ? 1 : 0, id)
      .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    const runtime = context.locals.runtime as any;
    const db = runtime?.env?.DB;
    if (!db) return new Response(JSON.stringify({ error: 'DB binding missing' }), { status: 500 });

    const body = await context.request.json();
    const { id } = body;

    await db.prepare(`DELETE FROM members WHERE id = ?`).bind(id).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
