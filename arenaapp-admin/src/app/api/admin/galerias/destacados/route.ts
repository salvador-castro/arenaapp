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

// GET /api/admin/galerias/destacados  (público, sin admin)
export async function GET(req: NextRequest) {
  try {
    const db = await getDb()

    const result = await db.query(
      `
      SELECT
        id,
        nombre,
        slug,
        descripcion_corta,
        resena,
        direccion,
        ciudad,
        provincia,
        pais,
        zona,
        lat,
        lng,
        telefono,
        email_contacto,
        sitio_web,
        instagram,
        facebook,
        anio_fundacion,
        tiene_entrada_gratuita,
        requiere_reserva,
        horario_desde,
        horario_hasta,
        url_imagen,
        estrellas,
        es_destacado,
        estado,
        created_at,
        updated_at
      FROM galerias
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
    console.error('Error GET /api/admin/galerias/destacados:', err)

    return new NextResponse(
      err?.message || 'Error al obtener galerías destacadas',
      {
        status: 500,
        headers: corsBaseHeaders(),
      }
    )
  }
}
