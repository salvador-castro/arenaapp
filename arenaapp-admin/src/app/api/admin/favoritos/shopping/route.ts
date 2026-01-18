import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import type { JwtPayload } from '@/lib/auth'

import { getCorsHeaders } from '@/lib/cors'

const FAVORITO_TIPO_SHOPPING = 'SHOPPING' as const

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

function getUserIdFromAuth(payload: JwtPayload): number {
  const userId = (payload as any)?.sub
  if (!userId) throw new Error('Token sin sub')
  const parsed = Number(userId)
  if (Number.isNaN(parsed)) throw new Error('sub no numérico')
  return parsed
}

export async function GET(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    if (!payload)
      return new NextResponse('No autorizado', {
        status: 401,
        headers: getCorsHeaders(req.headers.get('origin')),
      })

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()

    const { rows } = await db.query(
      `
      SELECT f.id AS favorito_id, s.id AS shopping_id, s.*
      FROM favoritos f
      JOIN shopping s ON s.id = f.item_id
      WHERE f.usuario_id = $1 AND f.tipo = $2
      ORDER BY f.id DESC
      `,
      [userId, FAVORITO_TIPO_SHOPPING]
    )

    return NextResponse.json(rows, { status: 200, headers: getCorsHeaders(req.headers.get('origin')) })
  } catch (err) {
    console.error('GET favoritos/shopping', err)
    return new NextResponse('Error', {
      status: 500,
      headers: getCorsHeaders(req.headers.get('origin')),
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    if (!payload)
      return new NextResponse('No autorizado', {
        status: 401,
        headers: getCorsHeaders(req.headers.get('origin')),
      })

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()
    const body = await req.json()

    const shoppingId = Number(body.shoppingId ?? body.shopping_id ?? body.id)
    if (!shoppingId)
      return new NextResponse('shoppingId inválido', {
        status: 400,
        headers: getCorsHeaders(req.headers.get('origin')),
      })

    await db.query(
      `INSERT INTO favoritos (usuario_id, tipo, item_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario_id, tipo, item_id) DO NOTHING`,
      [userId, FAVORITO_TIPO_SHOPPING, shoppingId]
    )

    return new NextResponse(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) })
  } catch (err) {
    console.error('POST favoritos/shopping', err)
    return new NextResponse('Error', {
      status: 500,
      headers: getCorsHeaders(req.headers.get('origin')),
    })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    if (!payload)
      return new NextResponse('No autorizado', {
        status: 401,
        headers: getCorsHeaders(req.headers.get('origin')),
      })

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()
    const body = await req.json()

    const shoppingId = Number(body.shoppingId ?? body.shopping_id ?? body.id)
    if (!shoppingId)
      return new NextResponse('shoppingId inválido', {
        status: 400,
        headers: getCorsHeaders(req.headers.get('origin')),
      })

    await db.query(
      `
      DELETE FROM favoritos
      WHERE usuario_id = $1 AND tipo = $2 AND item_id = $3
      `,
      [userId, FAVORITO_TIPO_SHOPPING, shoppingId]
    )

    return new NextResponse(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) })
  } catch (err) {
    console.error('DELETE favoritos/shopping', err)
    return new NextResponse('Error', {
      status: 500,
      headers: getCorsHeaders(req.headers.get('origin')),
    })
  }
}
