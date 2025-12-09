///Users/salvacastro/Desktop/arenaapp/arenaapp-admin/src/app/api/admin/galerias/public/route.ts
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

// GET /api/admin/galerias/public  (público, solo PUBLICADO)
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
          es_destacado,
          estado,
          created_at,
          updated_at
        FROM galerias
        WHERE
          estado = 'PUBLICADO'
          AND (
            LOWER(nombre) LIKE $1
            OR LOWER(COALESCE(ciudad, '')) LIKE $1
            OR LOWER(COALESCE(provincia, '')) LIKE $1
            OR LOWER(COALESCE(zona, '')) LIKE $1
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
          es_destacado,
          estado,
          created_at,
          updated_at
        FROM galerias
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
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/galerias/public:', err)

    return new NextResponse(
      err?.message || 'Error al obtener galerías públicas',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}
