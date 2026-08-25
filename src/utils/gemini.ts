import type { AppState, DayOfWeek } from '../types';

const DAYS_ORDER: DayOfWeek[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

export function buildFullJSONContext(state: AppState) {
  const jsDay = new Date().getDay(); // 0: Sun, 1: Mon, ...
  const daysMap: Record<number, DayOfWeek> = {
    1: 'LUNES', 2: 'MARTES', 3: 'MIERCOLES', 4: 'JUEVES', 5: 'VIERNES', 6: 'SABADO', 0: 'DOMINGO'
  };
  const today = daysMap[jsDay] || 'LUNES';
  const todayIdx = DAYS_ORDER.indexOf(today);
  const tomorrow = DAYS_ORDER[(todayIdx + 1) % 7];
  const yesterday = DAYS_ORDER[(todayIdx + 6) % 7];

  const weeklyScheduleByDay: Record<string, any[]> = {};

  DAYS_ORDER.forEach((day) => {
    weeklyScheduleByDay[day] = [];
    state.activities.forEach((act) => {
      const assignedId = state.schedule[act.id]?.[day];
      const assignedMember = state.members.find((m) => m.id === assignedId);
      const compKey = `${state.activeWeek}_${act.id}_${day}`;
      const comp = state.completions[compKey];
      const isDone = !!comp?.completed;
      const actualDoer = comp?.completedBy
        ? state.members.find((m) => m.id === comp.completedBy)
        : assignedMember;

      if (assignedMember || isDone) {
        weeklyScheduleByDay[day].push({
          actividad_id: act.id,
          nombre_actividad: act.name,
          turno: act.slot,
          asignado_original: assignedMember ? assignedMember.name : 'SIN ASIGNAR',
          estado: isDone ? 'REALIZADA' : 'PENDIENTE',
          realizado_por: isDone ? (actualDoer ? actualDoer.name : 'DESCONOCIDO') : null,
        });
      }
    });
  });

  return {
    informacion_fecha_actual: {
      dia_de_hoy: today,
      dia_de_manana: tomorrow,
      dia_de_ayer: yesterday,
      semana_activa: state.activeWeek,
    },
    integrantes_familia: state.members.map((m) => ({
      id: m.id,
      nombre: m.name,
      tipo: m.isSpecial ? 'ETIQUETA_ESPECIAL' : 'PERSONA',
    })),
    programacion_semanal_por_dia: weeklyScheduleByDay,
  };
}

export function buildSystemPrompt(state: AppState): string {
  const jsonContext = buildFullJSONContext(state);

  return `
Eres FamilyHub Bot, un inteligente asistente virtual de organización del hogar impulsado por Google Gemini.
A continuación tienes el JSON COMPLETO Y EXACTO con todo el estado del plan de limpieza y actividades de la familia para toda la semana.

DATOS DE CONTEXTO EN FORMATO JSON:
\`\`\`json
${JSON.stringify(jsonContext, null, 2)}
\`\`\`

REGLAS DE INTERPRETACIÓN DE FECHAS:
1. "hoy" se refiere a: ${jsonContext.informacion_fecha_actual.dia_de_hoy}
2. "mañana" se refiere a: ${jsonContext.informacion_fecha_actual.dia_de_manana}
3. "ayer" se refiere a: ${jsonContext.informacion_fecha_actual.dia_de_ayer}
4. Si la pregunta menciona "mañana" (ej: "¿quién busca a Mathias mañana?"), debes buscar las actividades del día ${jsonContext.informacion_fecha_actual.dia_de_manana}.
5. Distingue entre el día "mañana" (día siguiente) y el turno "MAÑANA" (horario matutino).

INSTRUCCIONES DE RESPUESTA:
- Responde de forma amable, precisa y estructurada en español.
- Menciona claramente el día al que te refieres (ej: "Para mañana MARTES...").
- Para preguntas sobre recoger o buscar niños del colegio (entradas/salidas), responde con el nombre de la persona asignada o que lo realizó.
`;
}

export async function askGemini(
  userPrompt: string,
  state: AppState,
  apiKey?: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(state);
  const keyToUse = apiKey || (import.meta.env.PUBLIC_GEMINI_API_KEY as string);

  if (keyToUse) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                { text: `Pregunta del usuario: ${userPrompt}` },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply;
    } catch (err: any) {
      console.warn('Error conectando con la API de Gemini:', err);
    }
  }

  // Smart Intelligent Local Fallback Response Engine
  return generateLocalSmartResponse(userPrompt, state);
}

function generateLocalSmartResponse(userPrompt: string, state: AppState): string {
  const p = userPrompt.toLowerCase().trim();
  const jsonContext = buildFullJSONContext(state);
  const { dia_de_hoy, dia_de_manana, dia_de_ayer } = jsonContext.informacion_fecha_actual;

  // Determine target day
  let targetDay: DayOfWeek = dia_de_hoy;
  let targetLabel = `hoy (${dia_de_hoy})`;

  if (p.includes('mañana') && !p.includes('turno mañana') && !p.includes('por la mañana')) {
    // If phrase includes "mañana" as day indicator
    targetDay = dia_de_manana as DayOfWeek;
    targetLabel = `mañana (${dia_de_manana})`;
  } else if (p.includes('ayer')) {
    targetDay = dia_de_ayer as DayOfWeek;
    targetLabel = `ayer (${dia_de_ayer})`;
  } else {
    // Check specific day mentions
    DAYS_ORDER.forEach((d) => {
      if (p.includes(d.toLowerCase())) {
        targetDay = d;
        targetLabel = d;
      }
    });
  }

  const dayActivities = jsonContext.programacion_semanal_por_dia[targetDay] || [];

  // Question 1: Who picks up / seeks Mathias or Santiago?
  if (p.includes('mathias') || p.includes('mathi') || p.includes('santi') || p.includes('colegio') || p.includes('busca') || p.includes('recoge') || p.includes('salida') || p.includes('entrada')) {
    const matches = dayActivities.filter(
      (a) => a.nombre_actividad.includes('MATHIAS') || a.nombre_actividad.includes('SANTIAGO') || a.nombre_actividad.includes('COLEGIO')
    );

    if (matches.length > 0) {
      const items = matches.map((a) => {
        const persona = a.estado === 'REALIZADA' ? a.realizado_por : a.asignado_original;
        const estadoTag = a.estado === 'REALIZADA' ? '✅ (Ya realizada)' : '⏳ (Pendiente)';
        return `• **${a.nombre_actividad}** [${a.turno}]: **${persona}** ${estadoTag}`;
      });
      return `🏫 **Información de colegio para ${targetLabel}:**\n\n${items.join('\n')}`;
    } else {
      return `🏫 No hay tareas registradas de colegio para **${targetLabel}**.`;
    }
  }

  // Question 2: What is pending?
  if (p.includes('pendiente') || p.includes('falta') || p.includes('que hay')) {
    const pending = dayActivities.filter((a) => a.estado === 'PENDIENTE');

    if (pending.length === 0) {
      return `🎉 **¡Excelente!** No hay tareas pendientes para **${targetLabel}**.`;
    }
    const items = pending.map((a) => `• [${a.turno}] **${a.nombre_actividad}** ➔ Asignado a **${a.asignado_original}**`);
    return `📋 **Tareas pendientes para ${targetLabel}:**\n\n${items.join('\n')}`;
  }

  // Question 3: Member specific query
  const matchedMember = state.members.find((m) => p.includes(m.name.toLowerCase()));
  if (matchedMember) {
    const memberItems = dayActivities.filter(
      (a) => a.asignado_original === matchedMember.name || a.realizado_por === matchedMember.name
    );

    if (memberItems.length > 0) {
      const items = memberItems.map(
        (a) => `• [${a.turno}] **${a.nombre_actividad}**: ${a.estado === 'REALIZADA' ? '✅ Realizada' : '⏳ Pendiente'}`
      );
      return `👤 **Tareas de ${matchedMember.name} para ${targetLabel}:**\n\n${items.join('\n')}`;
    } else {
      return `👤 **${matchedMember.name}** no tiene tareas registradas para **${targetLabel}**.`;
    }
  }

  // Default overview for the requested day
  if (dayActivities.length > 0) {
    const items = dayActivities
      .slice(0, 8)
      .map((a) => `• [${a.turno}] **${a.nombre_actividad}**: ${a.asignado_original}`);
    return `📅 **Resumen del plan para ${targetLabel}:**\n\n${items.join('\n')}`;
  }

  return `🤖 **FamilyHub Gemini Bot**:
He analizado el contexto para **${targetLabel}**. Puedes preguntarme:
- *"¿Quién busca a Mathias mañana?"*
- *"¿Qué hay pendiente para mañana?"*
- *"¿Qué le toca hacer a Dani el jueves?"*`;
}
