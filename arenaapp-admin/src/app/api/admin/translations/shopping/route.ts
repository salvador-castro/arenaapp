// src/app/api/admin/translations/shopping/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { autoTranslate } from '@/lib/translateHelper'
import { getCorsHeaders } from '@/lib/cors'

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(origin),
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  try {
    const body = await req.json().catch(() => null)

    const shoppingId = body?.shoppingId || body?.id
    if (!shoppingId || typeof shoppingId !== 'number') {
      return NextResponse.json(
        { error: 'shoppingId es obligatorio y debe ser número' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    // Llamar a la traducción automática
    await autoTranslate('shopping', shoppingId)

    return NextResponse.json(
      {
        success: true,
        shoppingId,
        message: 'Shopping traducido exitosamente',
      },
      { headers: getCorsHeaders(origin) }
    )
  } catch (err: any) {
    console.error('Error en /api/admin/translations/shopping', err)
    return NextResponse.json(
      { error: 'Error interno en traducción de shopping' },
      { status: 500, headers: getCorsHeaders(origin) }
    )
  }
}
