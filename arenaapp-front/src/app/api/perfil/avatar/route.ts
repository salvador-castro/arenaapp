// arenaapp-front/src/app/api/perfil/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server'

const FRONT_ORIGIN =
  process.env.FRONT_ORIGIN ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000'

function corsBaseHeaders() {
  return {
    'Access-Control-Allow-Origin': FRONT_ORIGIN,
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Preflight
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsBaseHeaders(),
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Stub: solo existe para que el validador de Next no rompa.
// Tu front **no** debería llamar nunca a este endpoint en producción.
// Siempre usás `${API_BASE}/api/auth/perfil/avatar` (el backend admin).
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Este endpoint solo es un stub en el front. Usá el backend admin (/api/auth/perfil/avatar).',
    },
    {
      status: 501,
      headers: corsBaseHeaders(),
    }
  )
}
