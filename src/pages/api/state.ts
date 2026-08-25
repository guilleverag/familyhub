import type { APIRoute } from 'astro';
import type { FamilyMember, Activity, ScheduleMap, CompletionsMap, DayOfWeek } from '../../types';

export const GET: APIRoute = async (context) => {
  try {
    const runtime = context.locals.runtime as any;
    const db = runtime?.env?.DB;

    if (!db) {
      return new Response(JSON.stringify({ error: 'DB binding missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Obtener Miembros
    const membersRes = await db.prepare('SELECT id, name, color, textColor, isSpecial FROM members').all();
    const members: FamilyMember[] = (membersRes.results || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      color: m.color,
      textColor: m.textColor,
      isSpecial: Boolean(m.isSpecial),
    }));

    // 2. Obtener Actividades ordenadas
    const activitiesRes = await db.prepare('SELECT id, name, slot, sortOrder FROM activities ORDER BY sortOrder ASC').all();
    const activities: Activity[] = (activitiesRes.results || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      slot: a.slot,
      order: a.sortOrder,
    }));

    // 3. Obtener Programación (Schedule)
    const scheduleRes = await db.prepare('SELECT activityId, dayOfWeek, memberId FROM schedule').all();
    const schedule: ScheduleMap = {};
    (scheduleRes.results || []).forEach((row: any) => {
      if (!schedule[row.activityId]) {
        schedule[row.activityId] = {
          LUNES: '', MARTES: '', MIERCOLES: '', JUEVES: '', VIERNES: '', SABADO: '', DOMINGO: ''
        };
      }
      schedule[row.activityId][row.dayOfWeek as DayOfWeek] = row.memberId;
    });

    // 4. Obtener Registros de Marcación (Completions)
    const completionsRes = await db.prepare('SELECT dateISO, activityId, dayOfWeek, completed, completedBy, completedAt, notes FROM completions').all();
    const completions: CompletionsMap = {};
    (completionsRes.results || []).forEach((c: any) => {
      const key = `${c.dateISO}_${c.activityId}`;
      completions[key] = {
        completed: Boolean(c.completed),
        completedBy: c.completedBy,
        completedAt: c.completedAt,
        notes: c.notes || undefined,
      };
    });

    return new Response(
      JSON.stringify({
        members,
        activities,
        schedule,
        completions,
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
