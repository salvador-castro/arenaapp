// src/app/api/admin/translations/bares/route.ts
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

    const barId = body?.barId
    if (!barId || typeof barId !== 'number') {
      return NextResponse.json(
        { error: 'barId es obligatorio y debe ser número' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    // Llamar a la traducción automática
    await autoTranslate('bares', barId)

    return NextResponse.json(
      {
        success: true,
        barId,
        message: 'Bar traducido exitosamente',
      },
      { headers: getCorsHeaders(origin) }
    )
  } catch (err: any) {
    console.error('Error en /api/admin/translations/bares', err)
    return NextResponse.json(
      { error: 'Error interno en traducción de bares', details: err.message },
      { status: 500, headers: getCorsHeaders(origin) }
    )
  }
}
