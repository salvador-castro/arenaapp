// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\api\admin\restaurantes\public\route.ts
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

// Helper para elegir traducción según lang
function pickTranslated(row: any, base: string, lang: 'es' | 'en' | 'pt') {
  if (lang === 'en') {
    const v = row[`${base}_en`]
    if (v != null && v !== '') return v
  }
  if (lang === 'pt') {
    const v = row[`${base}_pt`]
    if (v != null && v !== '') return v
  }
  // fallback: español original
  return row[base]
}

// GET /api/admin/restaurantes/public  (público, solo PUBLICADO)
export async function GET(req: NextRequest) {
  try {
    const db = await getDb()

    const { searchParams } = new URL(req.url)
    const search = (searchParams.get('search') || '').trim().toLowerCase()

    const langParam = (searchParams.get('lang') || 'es').toLowerCase()
    const lang: 'es' | 'en' | 'pt' =
      langParam === 'en' || langParam === 'pt' ? langParam : 'es'

    let rows: any[] = []

    if (search) {
      const like = `%${search}%`
      const result = await db.query(
        `
        SELECT *
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
        SELECT *
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

    const data = rows.map((row) => ({
      id: row.id,
      nombre: pickTranslated(row, 'nombre', lang),
      tipo_comida: pickTranslated(row, 'tipo_comida', lang),
      slug: row.slug,
      descripcion_corta: pickTranslated(row, 'descripcion_corta', lang),
      descripcion_larga: pickTranslated(row, 'descripcion_larga', lang),
      direccion: row.direccion,
      url_maps: row.url_maps,
      horario_text: pickTranslated(row, 'horario_text', lang),
      ciudad: row.ciudad,
      provincia: row.provincia,
      zona: row.zona,
      pais: row.pais,
      sitio_web: row.sitio_web,
      rango_precios: row.rango_precios,
      estrellas: row.estrellas,
      moneda: row.moneda,
      es_destacado: row.es_destacado,
      url_reservas: row.url_reservas,
      url_reserva: row.url_reserva,
      url_instagram: row.url_instagram,
      url_imagen: row.url_imagen,
      resena: pickTranslated(row, 'resena', lang),
      meta_title: pickTranslated(row, 'meta_title', lang),
      meta_description: pickTranslated(row, 'meta_description', lang),
    }))

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/restaurantes/public:', err)

    return new NextResponse(
      err?.message || 'Error al obtener restaurantes públicos',
      {
        status: 500,
        headers: corsBaseHeaders(),
      }
    )
  }
}
