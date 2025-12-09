import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

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

/* =========================
   GET → listar favoritos
========================= */
export async function GET (req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    const userId = auth.userId

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

    return NextResponse.json(rows, {
      headers: corsBaseHeaders()
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401, headers: corsBaseHeaders() }
    )
  }
}

/* =========================
   POST → guardar favorito
========================= */
export async function POST (req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    const userId = auth.userId

    const { restauranteId } = await req.json()

    if (!restauranteId) {
      return NextResponse.json(
        { error: 'restauranteId requerido' },
        { status: 400, headers: corsBaseHeaders() }
      )
    }

    const db = await getDb()

    await db.query(
      `
      INSERT INTO public.favoritos (usuario_id, tipo, item_id)
      VALUES ($1, 'RESTAURANTE'::tipo_favorito, $2)
      ON CONFLICT (usuario_id, tipo, item_id) DO NOTHING
      `,
      [userId, restauranteId]
    )

    return NextResponse.json(
      { ok: true },
      { status: 201, headers: corsBaseHeaders() }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401, headers: corsBaseHeaders() }
    )
  }
}

/* =========================
   DELETE → quitar favorito
========================= */
export async function DELETE (req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    const userId = auth.userId

    const { restauranteId } = await req.json()

    const db = await getDb()

    await db.query(
      `
      DELETE FROM public.favoritos
      WHERE usuario_id = $1
        AND tipo = 'RESTAURANTE'::tipo_favorito
        AND item_id = $2
      `,
      [userId, restauranteId]
    )

    return NextResponse.json(
      { ok: true },
      { headers: corsBaseHeaders() }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401, headers: corsBaseHeaders() }
    )
  }
}
