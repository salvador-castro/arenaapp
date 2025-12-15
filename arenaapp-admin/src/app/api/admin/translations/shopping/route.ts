// src/app/api/admin/translations/shopping/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { autoTranslate } from '@/lib/translateHelper'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const shoppingId = body?.shoppingId || body?.id
    if (!shoppingId || typeof shoppingId !== 'number') {
      return NextResponse.json(
        { error: 'shoppingId es obligatorio y debe ser número' },
        { status: 400 }
      )
    }

    // Llamar a la traducción automática
    await autoTranslate('shopping', shoppingId)

    return NextResponse.json({
      success: true,
      shoppingId,
      message: 'Shopping traducido exitosamente',
    })
  } catch (err: any) {
    console.error('Error en /api/admin/translations/shopping', err)
    return NextResponse.json(
      { error: 'Error interno en traducción de shopping' },
      { status: 500 }
    )
  }
}
