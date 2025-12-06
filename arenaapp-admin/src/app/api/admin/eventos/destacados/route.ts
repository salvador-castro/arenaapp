import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

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
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

// GET /api/admin/eventos/destacados (público)
export async function GET (req: NextRequest) {
  try {
    const db = await getDb()

    const result = await db.query(
      `
      SELECT
        id,
        titulo,
        slug,
        descripcion_corta,
        descripcion_larga,
        categoria,
        es_destacado,
        fecha_inicio,
        fecha_fin,
        es_todo_el_dia,
        lugar_id,
        nombre_lugar,
        direccion,
        ciudad,
        provincia,
        pais,
        lat,
        lng,
        es_gratuito,
        precio_desde,
        moneda,
        url_entradas,
        edad_minima,
        estado,
        visibilidad,
        published_at,
        imagen_principal
      FROM eventos
      WHERE
        es_destacado = TRUE
        AND estado = 'PUBLICADO'
        AND visibilidad = 'PUBLICO'
      ORDER BY
        fecha_inicio ASC NULLS LAST,
        titulo ASC
      LIMIT 20
      `
    )

    return new NextResponse(JSON.stringify(result.rows), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/eventos/destacados:', err)

    return new NextResponse(
      err?.message || 'Error al obtener eventos destacados',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}
