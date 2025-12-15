// src/app/api/admin/translations/galerias/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { autoTranslate } from '@/lib/translateHelper'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const galeriaId = body?.galeriaId || body?.id
    if (!galeriaId || typeof galeriaId !== 'number') {
      return NextResponse.json(
        { error: 'galeriaId es obligatorio y debe ser número' },
        { status: 400 }
      )
    }

    // Llamar a la traducción automática
    await autoTranslate('galerias', galeriaId)

    return NextResponse.json({
      success: true,
      galeriaId,
      message: 'Galería traducida exitosamente',
    })
  } catch (err: any) {
    console.error('Error en /api/admin/translations/galerias', err)
    return NextResponse.json(
      { error: 'Error interno en traducción de galerías' },
      { status: 500 }
    )
  }
}
