///Users/salvacastro/Desktop/arenaapp/arenaapp-admin/src/app/api/admin/shopping/public/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'

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
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// GET /api/admin/shopping/public  (público, solo estado = 'PUBLICADO')
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
          slug,
          nombre,
          rango_precios,
          estrellas,
          zona,
          direccion,
          ciudad,
          provincia,
          pais,
          horario_text,
          sitio_web,
          url_imagen,
          cantidad_locales,
          tiene_estacionamiento,
          tiene_patio_comidas,
          tiene_cine,
          es_outlet,
          es_destacado,
          telefono,
          instagram,
          facebook,
          estado,
          resena,
          created_at,
          updated_at
        FROM shopping
        WHERE
          estado = 'PUBLICADO'
          AND (
            LOWER(nombre) LIKE $1
            OR LOWER(COALESCE(zona, '')) LIKE $1
            OR LOWER(COALESCE(ciudad, '')) LIKE $1
            OR LOWER(COALESCE(provincia, '')) LIKE $1
          )
        ORDER BY
          es_destacado DESC,
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
          slug,
          nombre,
          rango_precios,
          estrellas,
          zona,
          direccion,
          ciudad,
          provincia,
          pais,
          horario_text,
          sitio_web,
          url_imagen,
          cantidad_locales,
          tiene_estacionamiento,
          tiene_patio_comidas,
          tiene_cine,
          es_outlet,
          es_destacado,
          telefono,
          instagram,
          facebook,
          estado,
          resena,
          created_at,
          updated_at
        FROM shopping
        WHERE estado = 'PUBLICADO'
        ORDER BY
          es_destacado DESC,
          nombre ASC
        `
      )
      rows = result.rows
    }

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/shopping/public:', err)

    return new NextResponse(
      err?.message || 'Error al obtener shoppings públicos',
      {
        status: 500,
        headers: corsBaseHeaders(),
      }
    )
  }
}
