import { NextRequest, NextResponse } from 'next/server';
import { getTurnos, createTurno, updateTurnoEstado, deleteTurno } from '@/lib/turnofa-store';
import { z } from 'zod';

const turnoSchema = z.object({
  cliente_nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  cliente_telefono: z.string().min(6, 'El teléfono es requerido'),
  cliente_email: z.string().email('Ingresá un Gmail / correo válido'),
  cliente_dni: z.string().min(4, 'El DNI es requerido'),
  servicio: z.string().min(2, 'Seleccioná un servicio de estética de pies'),
  duracion_minutos: z.number().int().positive().default(45),
  precio: z.number().nonnegative().default(0),
  fecha_hora: z.string().datetime({ message: 'Fecha y hora inválidas' }),
  notas: z.string().optional()
});

const patchSchema = z.object({
  id: z.string().min(1),
  estado: z.enum(['confirmado', 'en_atencion', 'completado', 'cancelado'])
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get('fecha') || undefined;
    const cliente_dni = searchParams.get('cliente_dni') || undefined;
    const turnos = await getTurnos({ fecha, cliente_dni });
    return NextResponse.json({ ok: true, turnos });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al consultar la agenda de turnos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = turnoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error.issues[0]?.message || 'Datos del turno inválidos' },
        { status: 400 }
      );
    }
    const turno = await createTurno(result.data);
    return NextResponse.json({ ok: true, turno });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al agendar el turno.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const result = patchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ ok: false, error: 'Datos de actualización inválidos.' }, { status: 400 });
    }
    const updated = await updateTurnoEstado(result.data.id, result.data.estado);
    if (!updated) {
      return NextResponse.json({ ok: false, error: 'Turno no encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, turno: updated });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al actualizar estado del turno.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'ID requerido.' }, { status: 400 });
    const deleted = await deleteTurno(id);
    return NextResponse.json({ ok: deleted });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al eliminar turno.' }, { status: 500 });
  }
}
