import { NextRequest, NextResponse } from 'next/server';
import { getClientes, createOrUpdateCliente } from '@/lib/turnofa-store';
import { z } from 'zod';

const clienteSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().min(6, 'Ingresá un teléfono válido'),
  email: z.string().email('Ingresá un Gmail / correo válido'),
  dni: z.string().min(4, 'Ingresá un DNI válido'),
  notas: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const clientes = await getClientes(search);
    return NextResponse.json({ ok: true, clientes });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al consultar clientes.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = clienteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error.issues[0]?.message || 'Datos incompletos' },
        { status: 400 }
      );
    }
    const cliente = await createOrUpdateCliente(result.data);
    return NextResponse.json({ ok: true, cliente });
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al registrar cliente.' }, { status: 500 });
  }
}
