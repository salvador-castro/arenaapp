import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import type { JwtPayload } from '@/lib/auth'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'
const FAVORITO_TIPO_SHOPPING = 'SHOPPING' as const

function corsBaseHeaders() {
  return {
    'Access-Control-Allow-Origin': FRONT_ORIGIN,
    'Access-Control-Allow-Credentials': 'true',
  }
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsBaseHeaders(),
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
        headers: corsBaseHeaders(),
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

    return NextResponse.json(rows, { status: 200, headers: corsBaseHeaders() })
  } catch (err) {
    console.error('GET favoritos/shopping', err)
    return new NextResponse('Error', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    if (!payload)
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders(),
      })

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()
    const body = await req.json()

    const shoppingId = Number(body.shoppingId ?? body.shopping_id ?? body.id)
    if (!shoppingId)
      return new NextResponse('shoppingId inválido', {
        status: 400,
        headers: corsBaseHeaders(),
      })

    await db.query(
      `INSERT INTO favoritos (usuario_id, tipo, item_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario_id, tipo, item_id) DO NOTHING`,
      [userId, FAVORITO_TIPO_SHOPPING, shoppingId]
    )

    return new NextResponse(null, { status: 204, headers: corsBaseHeaders() })
  } catch (err) {
    console.error('POST favoritos/shopping', err)
    return new NextResponse('Error', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    if (!payload)
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders(),
      })

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()
    const body = await req.json()

    const shoppingId = Number(body.shoppingId ?? body.shopping_id ?? body.id)
    if (!shoppingId)
      return new NextResponse('shoppingId inválido', {
        status: 400,
        headers: corsBaseHeaders(),
      })

    await db.query(
      `
      DELETE FROM favoritos
      WHERE usuario_id = $1 AND tipo = $2 AND item_id = $3
      `,
      [userId, FAVORITO_TIPO_SHOPPING, shoppingId]
    )

    return new NextResponse(null, { status: 204, headers: corsBaseHeaders() })
  } catch (err) {
    console.error('DELETE favoritos/shopping', err)
    return new NextResponse('Error', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}
