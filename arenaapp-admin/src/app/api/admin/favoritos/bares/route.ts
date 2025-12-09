// /Users/salvacastro/Desktop/arenaapp/arenaapp-admin/src/app/api/admin/favoritos/bares/route.ts
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
  try {
    const auth = await verifyAuth(req)
    const userId = getUserIdFromAuth(auth)
    const db = await getDb()

    const query = `
      SELECT
        f.id AS favorito_id,
        f.created_at,
        b.id AS bar_id,
        b.*
      FROM public.favoritos f
      JOIN public.bares b ON b.id = f.item_id
      WHERE f.usuario_id = $1
        AND f.tipo = $2::tipo_favorito
        AND b.estado = 'PUBLICADO'::estado_publicacion
      ORDER BY f.created_at DESC
    `

    const { rows } = await db.query(query, [userId, FAVORITO_TIPO_BAR])

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error en GET /api/admin/favoritos/bares', err?.message ?? err)
    const status =
      err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500

    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Error interno o no autenticado' }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}

/* =========================
   POST → guardar favorito
========================= */
export async function POST (req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    const userId = getUserIdFromAuth(auth)

    const body = await req.json().catch(() => null)
    const barId = Number(body?.barId)

    if (!barId || Number.isNaN(barId)) {
      return new NextResponse(
        JSON.stringify({ error: 'barId inválido' }),
        { status: 400, headers: { ...corsBaseHeaders() } }
      )
    }

    const db = await getDb()

    await db.query(
      `
      INSERT INTO public.favoritos (usuario_id, tipo, item_id)
      VALUES ($1, $2::tipo_favorito, $3)
      ON CONFLICT (usuario_id, tipo, item_id) DO NOTHING
      `,
      [userId, FAVORITO_TIPO_BAR, barId]
    )

    return new NextResponse(
      JSON.stringify({ ok: true }),
      {
        status: 201,
        headers: {
          ...corsBaseHeaders(),
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (err: any) {
    console.error('Error en POST /api/admin/favoritos/bares', err?.message ?? err)
    const status =
      err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500

    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Error interno o no autenticado' }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}

/* =========================
   DELETE → quitar favorito
========================= */
export async function DELETE (req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    const userId = getUserIdFromAuth(auth)

    const body = await req.json().catch(() => null)
    const barId = Number(body?.barId)

    if (!barId || Number.isNaN(barId)) {
      return new NextResponse(
        JSON.stringify({ error: 'barId inválido' }),
        { status: 400, headers: { ...corsBaseHeaders() } }
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

    return new NextResponse(
      JSON.stringify({ ok: true }),
      {
        status: 200,
        headers: {
          ...corsBaseHeaders(),
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (err: any) {
    console.error('Error en DELETE /api/admin/favoritos/bares', err?.message ?? err)
    const status =
      err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500

    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Error interno o no autenticado' }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}
