// /Users/salvacastro/Desktop/arenaapp/arenaapp-admin/src/app/api/admin/favoritos/galerias/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import type { JwtPayload } from '@/lib/auth'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'
const FAVORITO_TIPO_GALERIA = 'LUGAR' // mismo enum que usás en restaurantes

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
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    }
  })
}

// Helper -> saca el userId del payload (igual que restaurantes)
function getUserIdFromAuth (payload: JwtPayload): number {
  // verifyAuth ya normaliza el id en `sub`
  const userId = Number(payload.sub)

  if (!userId || Number.isNaN(userId)) {
    throw new Error('UNAUTHORIZED_INVALID_USER')
  }

  return userId
}

/* =========================
   GET → listar favoritos GALERÍAS
========================= */
export async function GET (req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    const userId = getUserIdFromAuth(auth)

    const db = await getDb()

    const query = `
      SELECT 
        f.id AS favorito_id,
        f.item_id,
        f.created_at,
        g.id        AS galeria_id,
        g.nombre,
        g.slug,
        g.descripcion_corta,
        g.direccion,
        g.ciudad,
        g.provincia,
        g.zona,
        g.pais,
        g.sitio_web,
        g.url_imagen,
        g.es_destacado
      FROM public.favoritos f
      JOIN public.galerias g ON g.id = f.item_id
      WHERE 
        f.usuario_id = $1
        AND f.tipo = $2::tipo_favorito
        AND g.estado = 'PUBLICADO'::estado_publicacion
      ORDER BY f.created_at DESC
    `

    const { rows } = await db.query(query, [userId, FAVORITO_TIPO_GALERIA])

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error en GET /api/admin/favoritos/galerias', err?.message ?? err)
    const status =
      err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500

    return new NextResponse(
      JSON.stringify({
        error: err?.message || 'Error interno o no autenticado'
      }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}

/* =========================
   POST → TOGGLE favorito GALERÍA
========================= */
export async function POST (req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    const userId = getUserIdFromAuth(auth)

    const body = await req.json().catch(() => null)
    const galeriaId = Number(body?.galeriaId || body?.itemId)

    if (!galeriaId || Number.isNaN(galeriaId)) {
      return new NextResponse(
        JSON.stringify({ error: 'galeriaId inválido' }),
        { status: 400, headers: { ...corsBaseHeaders() } }
      )
    }

    const db = await getDb()

    // ¿Ya existe como favorito?
    const existingQuery = `
      SELECT id
      FROM public.favoritos
      WHERE 
        usuario_id = $1
        AND tipo = $2::tipo_favorito
        AND item_id = $3
    `
    const existing = await db.query(existingQuery, [
      userId,
      FAVORITO_TIPO_GALERIA,
      galeriaId
    ])

    // Si existe → lo borramos (toggle OFF)
    if (existing.rows.length > 0) {
      const favoritoId = existing.rows[0].id

      await db.query(
        `
        DELETE FROM public.favoritos
        WHERE id = $1
        `,
        [favoritoId]
      )

      return new NextResponse(
        JSON.stringify({
          ok: true,
          isFavorite: false,
          favoritoId
        }),
        {
          status: 200,
          headers: {
            ...corsBaseHeaders(),
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // No existe → lo creamos (toggle ON)
    const insertQuery = `
      INSERT INTO public.favoritos (usuario_id, tipo, item_id)
      VALUES ($1, $2::tipo_favorito, $3)
      RETURNING id, created_at
    `
    const insert = await db.query(insertQuery, [
      userId,
      FAVORITO_TIPO_GALERIA,
      galeriaId
    ])

    const nuevoId = insert.rows[0].id

    return new NextResponse(
      JSON.stringify({
        ok: true,
        isFavorite: true,
        favoritoId: nuevoId
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
    console.error('Error en POST /api/admin/favoritos/galerias', err?.message ?? err)
    const status =
      err?.message?.startsWith('UNAUTHORIZED') ? 401 : 500

    return new NextResponse(
      JSON.stringify({
        error: err?.message || 'Error interno o no autenticado'
      }),
      { status, headers: { ...corsBaseHeaders() } }
    )
  }
}
