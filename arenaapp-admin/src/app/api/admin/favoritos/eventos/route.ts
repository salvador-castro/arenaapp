// /Users/salvacastro/Desktop/arenaapp/arenaapp-admin/src/app/api/admin/favoritos/eventos/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import type { JwtPayload } from '@/lib/auth'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'
const FAVORITO_TIPO_EVENTO = 'LUGAR' // mismo tipo_favorito que usás para restaurantes/bares

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

// Helper -> saca el userId del payload
function getUserIdFromAuth (payload: JwtPayload): number {
  const userId = Number(payload.sub)

  if (!userId || Number.isNaN(userId)) {
    throw new Error('UNAUTHORIZED_INVALID_USER')
  }

  return userId
}

/* =========================
   GET → listar favoritos de eventos
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
        e.id AS evento_id,
        e.titulo,
        e.slug,
        e.categoria,
        e.es_destacado,
        e.fecha_inicio,
        e.fecha_fin,
        e.es_todo_el_dia,
        e.zona,
        e.direccion,
        e.es_gratuito,
        e.precio_desde,
        e.moneda,
        e.url_entradas,
        e.estado,
        e.visibilidad,
        e.resena,
        e.imagen_principal
      FROM public.favoritos f
      JOIN public.eventos e ON e.id = f.item_id
      WHERE f.usuario_id = $1
        AND f.tipo = $2::tipo_favorito
        AND e.estado = 'PUBLICADO'
        AND e.visibilidad = 'PUBLICO'
      ORDER BY f.created_at DESC
    `

    const { rows } = await db.query(query, [userId, FAVORITO_TIPO_EVENTO])

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error en GET /api/admin/favoritos/eventos', err?.message ?? err)
    const status =
      err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500

    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Error interno o no autenticado' }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}

/* =========================
   POST → guardar favorito de evento
========================= */
export async function POST (req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    const userId = getUserIdFromAuth(auth)

    const body = await req.json().catch(() => null)
    const eventoId = Number(body?.eventoId)

    if (!eventoId || Number.isNaN(eventoId)) {
      return new NextResponse(
        JSON.stringify({ error: 'eventoId inválido' }),
        { status: 400, headers: { ...corsBaseHeaders() } }
      )
    }

    const db = await getDb()

    const query = `
      INSERT INTO public.favoritos (usuario_id, tipo, item_id)
      VALUES ($1, $2::tipo_favorito, $3)
      ON CONFLICT (usuario_id, tipo, item_id)
      DO NOTHING
      RETURNING id, created_at
    `
    const { rows } = await db.query(query, [
      userId,
      FAVORITO_TIPO_EVENTO,
      eventoId
    ])

    return new NextResponse(
      JSON.stringify({
        ok: true,
        created: rows.length > 0
      }),
      {
        status: 201,
        headers: {
          ...corsBaseHeaders(),
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (err: any) {
    console.error('Error en POST /api/admin/favoritos/eventos', err?.message ?? err)
    const status =
      err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500

    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Error interno o no autenticado' }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}

/* =========================
   DELETE → quitar favorito de evento
========================= */
export async function DELETE (req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    const userId = getUserIdFromAuth(auth)

    const body = await req.json().catch(() => null)
    const eventoId = Number(body?.eventoId)

    if (!eventoId || Number.isNaN(eventoId)) {
      return new NextResponse(
        JSON.stringify({ error: 'eventoId inválido' }),
        { status: 400, headers: { ...corsBaseHeaders() } }
      )
    }

    const db = await getDb()
    const query = `
      DELETE FROM public.favoritos
      WHERE usuario_id = $1
        AND tipo = $2::tipo_favorito
        AND item_id = $3
    `
    await db.query(query, [userId, FAVORITO_TIPO_EVENTO, eventoId])

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
    console.error('Error en DELETE /api/admin/favoritos/eventos', err?.message ?? err)
    const status =
      err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500

    return new NextResponse(
      JSON.stringify({ error: err?.message || 'Error interno o no autenticado' }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}
