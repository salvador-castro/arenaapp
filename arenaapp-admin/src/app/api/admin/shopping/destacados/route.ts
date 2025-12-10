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

// GET /api/admin/shopping/destacados  (público, sin admin, solo destacados + PUBLICADO)
export async function GET(_req: NextRequest) {
  try {
    const db = await getDb()

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
        es_destacado = TRUE
        AND estado = 'PUBLICADO'
      ORDER BY
        nombre ASC
      `
    )

    return new NextResponse(JSON.stringify(result.rows), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/shopping/destacados:', err)

    return new NextResponse(
      err?.message || 'Error al obtener shoppings destacados',
      {
        status: 500,
        headers: corsBaseHeaders(),
      }
    )
  }
}
