import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  try {
    const runtime = context.locals.runtime as any;
    const db = runtime?.env?.DB;
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
  try {
    const runtime = context.locals.runtime as any;
    const db = runtime?.env?.DB;
    if (!db) return new Response(JSON.stringify({ error: 'DB binding missing' }), { status: 500 });

    const body = await context.request.json();
    
    // Soporte para reordenamiento en lote de varias actividades
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
  try {
    const runtime = context.locals.runtime as any;
    const db = runtime?.env?.DB;
    if (!db) return new Response(JSON.stringify({ error: 'DB binding missing' }), { status: 500 });

    const body = await context.request.json();
    const { id } = body;

    await db.prepare(`DELETE FROM activities WHERE id = ?`).bind(id).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
