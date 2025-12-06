// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\api\admin\bares\public\route.ts
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

// GET /api/admin/bares/public  (público, solo estado = PUBLICADO)
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
          descripcion_larga,
          direccion,
          ciudad,
          provincia,
          pais,
          zona,
          tipo_comida,
          rango_precios,
          estrellas,
          moneda,
          es_destacado,
          sitio_web,
          instagram,
          facebook,
          url_imagen,
          imagen_principal,
          url_reserva,
          url_maps,
          horario_text,
          resena,
          tiene_terraza,
          tiene_musica_vivo,
          tiene_happy_hour
        FROM bares
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
          slug,
          descripcion_corta,
          descripcion_larga,
          direccion,
          ciudad,
          provincia,
          pais,
          zona,
          tipo_comida,
          rango_precios,
          estrellas,
          moneda,
          es_destacado,
          sitio_web,
          instagram,
          facebook,
          url_imagen,
          imagen_principal,
          url_reserva,
          url_maps,
          horario_text,
          resena,
          tiene_terraza,
          tiene_musica_vivo,
          tiene_happy_hour
        FROM bares
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

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/bares/public:', err)

    return new NextResponse(
      err?.message || 'Error al obtener bares públicos',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}
