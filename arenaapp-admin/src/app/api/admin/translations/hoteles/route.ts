// src/app/api/admin/translations/hoteles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { autoTranslate } from '@/lib/translateHelper'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const hotelId = body?.hotelId || body?.id
    if (!hotelId || typeof hotelId !== 'number') {
      return NextResponse.json(
        { error: 'hotelId es obligatorio y debe ser número' },
        { status: 400 }
      )
    }

    // Llamar a la traducción automática
    await autoTranslate('hoteles', hotelId)

    return NextResponse.json({
      success: true,
      hotelId,
      message: 'Hotel traducido exitosamente',
    })
  } catch (err: any) {
    console.error('Error en /api/admin/translations/hoteles', err)
    return NextResponse.json(
      { error: 'Error interno en traducción de hoteles' },
      { status: 500 }
    )
  }
}
