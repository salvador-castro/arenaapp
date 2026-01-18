import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import type { JwtPayload } from '@/lib/auth'

import { getCorsHeaders } from '@/lib/cors'

const FAVORITO_TIPO_RESTAURANTE = 'RESTAURANTE' as const // 👈 clave

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(origin),
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  })
}

// Helper → saca el userId del payload
function getUserIdFromAuth(payload: JwtPayload): number {
  const userId = (payload as any)?.sub
  if (!userId) {
    throw new Error('Token sin sub (userId)')
  }
  const parsed = Number(userId)
  if (Number.isNaN(parsed)) {
    throw new Error('sub del token no es numérico')
  }
  return parsed
}

// GET → lista favoritos de RESTAURANTES para el usuario logueado
export async function GET(req: NextRequest) {
  try {
    const payload = await verifyAuth(req) // 👈 ahora devuelve directamente JwtPayload
    if (!payload) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: getCorsHeaders(req.headers.get('origin')),
      })
    }

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()

    const { rows } = await db.query(
      `
      SELECT
        f.id AS favorito_id,
        r.id AS restaurante_id,
        r.*
      FROM favoritos f
      JOIN restaurantes r ON r.id = f.item_id
      WHERE f.usuario_id = $1
        AND f.tipo = $2
      ORDER BY f.id DESC
      `,
      [userId, FAVORITO_TIPO_RESTAURANTE]
    )

    return NextResponse.json(rows, {
      status: 200,
      headers: getCorsHeaders(req.headers.get('origin')),
    })
  } catch (err: any) {
    console.error('Error GET /favoritos/restaurantes', {
      message: err?.message,
      stack: err?.stack,
      error: err,
    })
    return new NextResponse(
      JSON.stringify({
        error: 'Error interno',
        message: err?.message || 'Error desconocido',
      }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(req.headers.get('origin')),
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

// POST → marca un restaurante como favorito
export async function POST(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    if (!payload) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: getCorsHeaders(req.headers.get('origin')),
      })
    }

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()
    const body = await req.json()

    const restauranteId = Number(
      body.restauranteId ?? body.restaurante_id ?? body.id
    )
    if (!restauranteId || Number.isNaN(restauranteId)) {
      return new NextResponse('restauranteId inválido', {
        status: 400,
        headers: getCorsHeaders(req.headers.get('origin')),
      })
    }

    await db.query(
      `
      INSERT INTO favoritos (usuario_id, tipo, item_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (usuario_id, tipo, item_id) DO NOTHING
      `,
      [userId, FAVORITO_TIPO_RESTAURANTE, restauranteId]
    )

    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(req.headers.get('origin')),
    })
  } catch (err: any) {
    console.error('Error POST /favoritos/restaurantes', err)
    return new NextResponse('Error interno', {
      status: 500,
      headers: getCorsHeaders(req.headers.get('origin')),
    })
  }
}

// DELETE → quita un restaurante de favoritos
export async function DELETE(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    if (!payload) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: getCorsHeaders(req.headers.get('origin')),
      })
    }

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()
    const body = await req.json()

    const restauranteId = Number(
      body.restauranteId ?? body.restaurante_id ?? body.id
    )
    if (!restauranteId || Number.isNaN(restauranteId)) {
      return new NextResponse('restauranteId inválido', {
        status: 400,
        headers: getCorsHeaders(req.headers.get('origin')),
      })
    }

    await db.query(
      `
      DELETE FROM favoritos
      WHERE usuario_id = $1
        AND tipo = $2
        AND item_id = $3
      `,
      [userId, FAVORITO_TIPO_RESTAURANTE, restauranteId]
    )

    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(req.headers.get('origin')),
    })
  } catch (err: any) {
    console.error('Error DELETE /favoritos/restaurantes', err)
    return new NextResponse('Error interno', {
      status: 500,
      headers: getCorsHeaders(req.headers.get('origin')),
    })
  }
}
