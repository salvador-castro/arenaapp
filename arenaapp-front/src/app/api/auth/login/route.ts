// arenaapp-front/src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server'

/**
 * Stub de login en el FRONT.
 * No se usa en producción porque el front llama directo a:
 * https://admin.arenapress.app/api/auth/login
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Este endpoint no se usa. El login se hace contra admin.arenapress.app/api/auth/login.'
    },
    { status: 410 } // Gone
  )
}
