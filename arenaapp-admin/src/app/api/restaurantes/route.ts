// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\api\restaurantes\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

import { getCorsHeaders } from '@/lib/cors'

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(origin),
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// GET /api/restaurantes  (público: USER, ADMIN, invitado si querés)
export async function GET(req: NextRequest) {
  try {
    const db = await getDb()
    const { searchParams } = new URL(req.url)
    const search = (searchParams.get('search') || '').trim().toLowerCase()

    let rows: any[] = []

    if (search) {
      const like = `%${search}%`

      const result = await db.query(
        `
        SELECT
          id,
          nombre,
          tipo_comida,
          slug,
          descripcion_corta,
          descripcion_larga,
          direccion,
          url_maps,
          horario_text,
          ciudad,
          provincia,
          zona,
          pais,
          sitio_web,
          rango_precios,
          estrellas,
          moneda,
          es_destacado,
          url_reservas,
          url_reserva,
          url_instagram,
          url_imagen,
          resena
        FROM restaurantes
        WHERE
          estado = 'PUBLICADO'
          AND (
            LOWER(nombre) LIKE $1
            OR LOWER(COALESCE(tipo_comida, '')) LIKE $1
            OR LOWER(COALESCE(zona, '')) LIKE $1
            OR LOWER(COALESCE(ciudad, '')) LIKE $1
          )
        ORDER BY
          es_destacado DESC,
          estrellas DESC NULLS LAST,
          rango_precios DESC NULLS LAST,
          nombre ASC
        `,
        [like]
      )

      rows = result.rows
    } else {
      const result = await db.query(
        `
        SELECT
          id,
          nombre,
          tipo_comida,
          slug,
          descripcion_corta,
          descripcion_larga,
          direccion,
          url_maps,
          horario_text,
          ciudad,
          provincia,
          zona,
          pais,
          sitio_web,
          rango_precios,
          estrellas,
          moneda,
          es_destacado,
          url_reservas,
          url_reserva,
          url_instagram,
          url_imagen,
          resena
        FROM restaurantes
        WHERE estado = 'PUBLICADO'
        ORDER BY
          es_destacado DESC,
          estrellas DESC NULLS LAST,
          rango_precios DESC NULLS LAST,
          nombre ASC
        `
      )

      rows = result.rows
    }

    const origin = req.headers.get('origin')
    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/restaurantes:', err)
    const origin = req.headers.get('origin')

    return new NextResponse(
      err?.message || 'Error al obtener restaurantes públicos',
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    )
  }
}
