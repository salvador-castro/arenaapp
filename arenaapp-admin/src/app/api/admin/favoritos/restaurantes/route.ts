// C:\Users\sacastro\Documents\proyects\arenaapp\arenaapp-admin\src\app\api\admin\favoritos\restaurantes\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import type { JwtPayload } from '@/lib/auth'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'

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
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

// Helper para obtener userId seguro desde el token
function getUserIdFromAuth(payload: JwtPayload) {
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
    const auth = await verifyAuth(req) as JwtPayload
    const userId = getUserIdFromAuth(auth)

    const db = await getDb()

    const query = `
      SELECT
        f.id AS favorito_id,
        f.created_at,
        r.id AS restaurante_id,
        r.nombre,
        r.tipo_comida,
        r.slug,
        r.descripcion_corta,
        r.descripcion_larga,
        r.direccion,
        r.url_maps,
        r.horario_text,
        r.ciudad,
        r.provincia,
        r.zona,
        r.pais,
        r.sitio_web,
        r.rango_precios,
        r.estrellas,
        r.es_destacado,
        r.url_reservas,
        r.url_reserva,
        r.url_instagram,
        r.url_imagen,
        r.resena
      FROM public.favoritos f
      JOIN public.restaurantes r ON r.id = f.item_id
      WHERE f.usuario_id = $1
        AND f.tipo = 'RESTAURANTE'::tipo_favorito
        AND r.estado = 'PUBLICADO'::estado_publicacion
      ORDER BY f.created_at DESC
    `

    const { rows } = await db.query(query, [userId])

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error en GET /api/admin/favoritos/restaurantes', err?.message ?? err)
    const status = err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500
    return new NextResponse(
      JSON.stringify({ error: 'Error interno o no autenticado' }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}

/* =========================
   POST → guardar favorito
========================= */
export async function POST (req: NextRequest) {
  try {
    const auth = await verifyAuth(req) as JwtPayload
    const userId = getUserIdFromAuth(auth)

    const body = await req.json().catch(() => null)
    const restauranteId = Number(body?.restauranteId)

    if (!restauranteId || Number.isNaN(restauranteId)) {
      return new NextResponse(
        JSON.stringify({ error: 'restauranteId inválido' }),
        { status: 400, headers: { ...corsBaseHeaders() } }
      )
    }

    const db = await getDb()

    const query = `
      INSERT INTO public.favoritos (usuario_id, tipo, item_id)
      VALUES ($1, 'RESTAURANTE'::tipo_favorito, $2)
      ON CONFLICT (usuario_id, tipo, item_id)
      DO NOTHING
      RETURNING id, created_at
    `
    const { rows } = await db.query(query, [userId, restauranteId])

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
    console.error('Error en POST /api/admin/favoritos/restaurantes', err?.message ?? err)
    const status = err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500
    return new NextResponse(
      JSON.stringify({ error: 'Error interno o no autenticado' }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}

/* =========================
   DELETE → quitar favorito
========================= */
export async function DELETE (req: NextRequest) {
  try {
    const auth = await verifyAuth(req) as JwtPayload
    const userId = getUserIdFromAuth(auth)

    const body = await req.json().catch(() => null)
    const restauranteId = Number(body?.restauranteId)

    if (!restauranteId || Number.isNaN(restauranteId)) {
      return new NextResponse(
        JSON.stringify({ error: 'restauranteId inválido' }),
        { status: 400, headers: { ...corsBaseHeaders() } }
      )
    }

    const db = await getDb()
    const query = `
      DELETE FROM public.favoritos
      WHERE usuario_id = $1
        AND tipo = 'RESTAURANTE'::tipo_favorito
        AND item_id = $2
    `
    await db.query(query, [userId, restauranteId])

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
    console.error('Error en DELETE /api/admin/favoritos/restaurantes', err?.message ?? err)
    const status = err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500
    return new NextResponse(
      JSON.stringify({ error: 'Error interno o no autenticado' }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}
