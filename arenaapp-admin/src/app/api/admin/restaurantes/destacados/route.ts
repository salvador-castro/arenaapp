// src/app/api/restaurantes/destacados/route.ts
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

// GET /api/restaurantes/destacados  (público, sin admin)
export async function GET (req: NextRequest) {
  try {
    const db = getDb()

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
        es_destacado = TRUE
        AND estado = 'PUBLICADO'
      ORDER BY
        estrellas DESC NULLS LAST,
        rango_precios DESC NULLS LAST,
        nombre ASC
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
    console.error('Error GET /api/restaurantes/destacados:', err)

    return new NextResponse(
      err?.message || 'Error al obtener restaurantes destacados',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}
