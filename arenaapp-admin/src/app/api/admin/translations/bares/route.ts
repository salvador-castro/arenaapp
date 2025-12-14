// src/app/api/admin/translations/bares/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { autoTranslate } from '@/lib/translateHelper'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const barId = body?.barId
    if (!barId || typeof barId !== 'number') {
      return NextResponse.json(
        { error: 'barId es obligatorio y debe ser número' },
        { status: 400 }
      )
    }

    // Llamar a la traducción automática
    await autoTranslate('bares', barId)

    return NextResponse.json({
      success: true,
      barId,
      message: 'Bar traducido exitosamente',
    })
  } catch (err: any) {
    console.error('Error en /api/admin/translations/bares', err)
    return NextResponse.json(
      { error: 'Error interno en traducción de bares', details: err.message },
      { status: 500 }
    )
  }
}
