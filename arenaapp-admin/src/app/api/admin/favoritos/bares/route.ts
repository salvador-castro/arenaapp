import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import type { JwtPayload } from '@/lib/auth'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'
const FAVORITO_TIPO_BAR = 'LUGAR' // mismo enum

function corsBaseHeaders () {
  return {
    'Access-Control-Allow-Origin': FRONT_ORIGIN,
    'Access-Control-Allow-Credentials': 'true'
  }
}

export function OPTIONS () {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsBaseHeaders(),
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    }
  })
}

function getUserIdFromAuth (payload: JwtPayload): number {
  const userId = Number(payload.sub)
  if (!userId || Number.isNaN(userId)) {
    throw new Error('UNAUTHORIZED_INVALID_USER')
  }
  return userId
}

/* =========================
   GET → listar favoritos
========================= */
export async function GET (req: NextRequest) {
  const auth = await verifyAuth(req)
  const userId = getUserIdFromAuth(auth)
  const db = await getDb()

  const query = `
    SELECT
      f.id AS favorito_id,
      f.created_at,
      b.*
    FROM public.favoritos f
    JOIN public.bares b ON b.id = f.item_id
    WHERE f.usuario_id = $1
      AND f.tipo = $2::tipo_favorito
      AND b.estado = 'PUBLICADO'::estado_publicacion
    ORDER BY f.created_at DESC
  `

  const { rows } = await db.query(query, [userId, FAVORITO_TIPO_BAR])
  return NextResponse.json(rows, { headers: corsBaseHeaders() })
}

/* =========================
   POST → guardar favorito
========================= */
export async function POST (req: NextRequest) {
  const auth = await verifyAuth(req)
  const userId = getUserIdFromAuth(auth)

  const body = await req.json()
  const barId = Number(body?.barId)

  if (!barId) {
    return NextResponse.json(
      { error: 'barId inválido' },
      { status: 400, headers: corsBaseHeaders() }
    )
  }

  const db = await getDb()

  await db.query(
    `
    INSERT INTO public.favoritos (usuario_id, tipo, item_id)
    VALUES ($1, $2::tipo_favorito, $3)
    ON CONFLICT DO NOTHING
    `,
    [userId, FAVORITO_TIPO_BAR, barId]
  )

  return NextResponse.json({ ok: true }, { headers: corsBaseHeaders() })
}

/* =========================
   DELETE → quitar favorito
========================= */
export async function DELETE (req: NextRequest) {
  const auth = await verifyAuth(req)
  const userId = getUserIdFromAuth(auth)

  const body = await req.json()
  const barId = Number(body?.barId)

  if (!barId) {
    return NextResponse.json(
      { error: 'barId inválido' },
      { status: 400, headers: corsBaseHeaders() }
    )
  }

  const db = await getDb()

  await db.query(
    `
    DELETE FROM public.favoritos
    WHERE usuario_id = $1
      AND tipo = $2::tipo_favorito
      AND item_id = $3
    `,
    [userId, FAVORITO_TIPO_BAR, barId]
  )

  return NextResponse.json({ ok: true }, { headers: corsBaseHeaders() })
}
