import { NextRequest, NextResponse } from 'next/server';
import { getRecordatoriosPendientes, registrarEnvioRecordatorio, getTurnos } from '@/lib/turnofa-store';
import { sendGmailReminder } from '@/lib/email-reminder';
import { z } from 'zod';

const dispatchSchema = z.object({
  turnoId: z.string().min(1),
  tipo: z.enum(['1_dia_antes', 'momento_turno'])
});

export async function GET() {
  try {
    const data = await getRecordatoriosPendientes();
    return NextResponse.json({ ok: true, ...data });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al consultar recordatorios pendientes.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = dispatchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ ok: false, error: 'Parámetros inválidos' }, { status: 400 });
    }

    const { turnoId, tipo } = result.data;
    const allTurnos = await getTurnos();
    const turno = allTurnos.find(t => t.id === turnoId);

    if (!turno) {
      return NextResponse.json({ ok: false, error: 'Turno no encontrado' }, { status: 404 });
    }

    // Despachar el recordatorio por Gmail
    const emailResult = await sendGmailReminder(turno, tipo);

    // Registrar en la base de datos y actualizar banderas del turno
    const log = await registrarEnvioRecordatorio(turnoId, tipo);

    return NextResponse.json({
      ok: true,
      emailResult,
      log,
      mensaje: `Recordatorio ${tipo === '1_dia_antes' ? 'de 24h previas' : 'del momento del turno'} enviado a ${turno.cliente_email}`
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al enviar recordatorio por Gmail.' }, { status: 500 });
  }
}
