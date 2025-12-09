// /Users/salvacastro/Desktop/arenaapp/arenaapp-admin/src/app/api/admin/eventos/public/route.ts
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

// GET /api/admin/eventos/public  (público)
// Solo eventos PUBLICADOS y PUBLICO
export async function GET (req: NextRequest) {
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
          titulo,
          slug,
          categoria,
          es_destacado,
          fecha_inicio,
          fecha_fin,
          es_todo_el_dia,
          zona,
          direccion,
          es_gratuito,
          precio_desde,
          moneda,
          url_entradas,
          estado,
          visibilidad,
          resena,
          imagen_principal
        FROM eventos
        WHERE
          estado = 'PUBLICADO'
          AND visibilidad = 'PUBLICO'
          AND (
            LOWER(titulo) LIKE $1
            OR LOWER(COALESCE(zona, '')) LIKE $1
            OR LOWER(COALESCE(categoria::text, '')) LIKE $1
          )
        ORDER BY
          fecha_inicio ASC NULLS LAST,
          es_destacado DESC,
          titulo ASC
        `,
        [like]
      )
      rows = result.rows
    } else {
      const result = await db.query(
        `
        SELECT
          id,
          titulo,
          slug,
          categoria,
          es_destacado,
          fecha_inicio,
          fecha_fin,
          es_todo_el_dia,
          zona,
          direccion,
          es_gratuito,
          precio_desde,
          moneda,
          url_entradas,
          estado,
          visibilidad,
          resena,
          imagen_principal
        FROM eventos
        WHERE
          estado = 'PUBLICADO'
          AND visibilidad = 'PUBLICO'
        ORDER BY
          fecha_inicio ASC NULLS LAST,
          es_destacado DESC,
          titulo ASC
        `
      )
      rows = result.rows
    }

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/eventos/public:', err)

    return new NextResponse(
      err?.message || 'Error al obtener eventos públicos',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}
