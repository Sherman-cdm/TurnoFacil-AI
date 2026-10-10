import { NextRequest, NextResponse } from 'next/server';

// Credenciales designadas solicitadas por el usuario:
const DESIGNATED_EMAIL = 'gm89168@gmail';
const DESIGNATED_PASSWORD = 'Cmd123';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('turnofa_reception_session');
  if (sessionCookie && sessionCookie.value === 'authorized_reception_turnofa') {
    return NextResponse.json({
      authenticated: true,
      user: {
        email: 'gm89168@gmail.com',
        nombre: 'Recepción Central TURNOFA',
        rol: 'recepcion'
      }
    });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password } = body;

    if (action === 'logout') {
      const response = NextResponse.json({ ok: true, message: 'Sesión cerrada exitosamente.' });
      response.cookies.delete('turnofa_reception_session');
      return response;
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    // Acepta tanto "gm89168@gmail" como "gm89168@gmail.com"
    const isEmailValid = cleanEmail === DESIGNATED_EMAIL || cleanEmail === `${DESIGNATED_EMAIL}.com`;
    const isPasswordValid = cleanPassword === DESIGNATED_PASSWORD;

    if (isEmailValid && isPasswordValid) {
      const response = NextResponse.json({
        ok: true,
        message: 'Acceso concedido a la recepción de TURNOFA.',
        user: {
          email: 'gm89168@gmail.com',
          nombre: 'Recepción Central TURNOFA',
          rol: 'recepcion'
        }
      });

      // Configurar cookie de sesión con 30 días de duración
      response.cookies.set({
        name: 'turnofa_reception_session',
        value: 'authorized_reception_turnofa',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30
      });

      return response;
    }

    return NextResponse.json(
      { ok: false, error: 'Credenciales inválidas. Verificá tu Gmail y contraseña designada.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al procesar la solicitud de acceso.' }, { status: 500 });
  }
}
