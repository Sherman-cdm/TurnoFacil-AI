import { NextRequest, NextResponse } from 'next/server';
import { askTurnofaAI } from '@/lib/gemini';
import { z } from 'zod';

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'model']),
    content: z.string().min(1).max(2000)
  })).min(1).max(50)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = chatRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 });
    }

    const reply = await askTurnofaAI(result.data.messages);
    return NextResponse.json({ reply, ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error en /api/chat', error);
    return NextResponse.json({ error: 'Error procesando la consulta con TURNOFA IA' }, { status: 500 });
  }
}
