// src/app/api/admin/translations/eventos/route.ts
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

    const eventoId = body?.eventoId || body?.id
    if (!eventoId || typeof eventoId !== 'number') {
      return NextResponse.json(
        { error: 'eventoId es obligatorio y debe ser número' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    // Llamar a la traducción automática
    await autoTranslate('eventos', eventoId)

    return NextResponse.json(
      {
        success: true,
        eventoId,
        message: 'Evento traducido exitosamente',
      },
      { headers: getCorsHeaders(origin) }
    )
  } catch (err: any) {
    console.error('Error en /api/admin/translations/eventos', err)
    return NextResponse.json(
      { error: 'Error interno en traducción de eventos', details: err.message },
      { status: 500, headers: getCorsHeaders(origin) }
    )
  }
}
