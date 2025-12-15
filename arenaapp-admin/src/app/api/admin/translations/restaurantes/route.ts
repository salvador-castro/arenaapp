// src/app/api/admin/translations/restaurantes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { autoTranslate } from '@/lib/translateHelper'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const restauranteId = body?.restauranteId || body?.id
    if (!restauranteId || typeof restauranteId !== 'number') {
      return NextResponse.json(
        { error: 'restauranteId es obligatorio y debe ser número' },
        { status: 400 }
      )
    }

    // Llamar a la traducción automática
    await autoTranslate('restaurantes', restauranteId)

    return NextResponse.json({
      success: true,
      restauranteId,
      message: 'Restaurante traducido exitosamente',
    })
  } catch (err: any) {
    console.error('Error en /api/admin/translations/restaurantes', err)
    return NextResponse.json(
      { error: 'Error interno en traducción de restaurantes' },
      { status: 500 }
    )
  }
}
