// /Users/salvacastro/Desktop/arenaapp/arenaapp-admin/src/app/api/admin/eventos/public/route.ts
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

// GET /api/admin/eventos/public  (público)
// Solo eventos PUBLICADOS y PUBLICO
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
        SELECT *
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

    const data = rows.map((row) => ({
      id: row.id,
      // 👇 estos campos salen ya traducidos según lang
      titulo: pickTranslated(row, 'titulo', lang),
      slug: row.slug,
      categoria: pickTranslated(row, 'categoria', lang),
      es_destacado: row.es_destacado,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      es_todo_el_dia: row.es_todo_el_dia,
      zona: row.zona,
      direccion: row.direccion,
      es_gratuito: row.es_gratuito,
      precio_desde: row.precio_desde,
      moneda: row.moneda,
      url_entradas: row.url_entradas,
      estado: row.estado,
      resena: pickTranslated(row, 'resena', lang),
      descripcion_corta: pickTranslated(row, 'descripcion_corta', lang),
      descripcion_larga: pickTranslated(row, 'descripcion_larga', lang),
      imagen_principal: row.imagen_principal,
      meta_title: pickTranslated(row, 'meta_title', lang),
      meta_description: pickTranslated(row, 'meta_description', lang),
      estrellas: row.estrellas,
    }))

    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/eventos/public:', err)

    return new NextResponse(
      err?.message || 'Error al obtener eventos públicos',
      {
        status: 500,
        headers: corsBaseHeaders(),
      }
    )
  }
}
