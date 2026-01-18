// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\api\admin\bares\public\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

import { getCorsHeaders } from '@/lib/cors'

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(origin),
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

// GET /api/admin/bares/public  (público, solo estado = PUBLICADO)
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
        SELECT
          id,
          nombre,
          nombre_en,
          nombre_pt,
          slug,
          descripcion_corta,
          descripcion_corta_en,
          descripcion_corta_pt,
          descripcion_larga,
          descripcion_larga_en,
          descripcion_larga_pt,
          direccion,
          ciudad,
          provincia,
          pais,
          zona,
          tipo_comida,
          tipo_comida_en,
          tipo_comida_pt,
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
          horario_text_en,
          horario_text_pt,
          resena,
          resena_en,
          resena_pt,
          meta_title,
          meta_title_en,
          meta_title_pt,
          meta_description,
          meta_description_en,
          meta_description_pt,
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
          nombre_en,
          nombre_pt,
          slug,
          descripcion_corta,
          descripcion_corta_en,
          descripcion_corta_pt,
          descripcion_larga,
          descripcion_larga_en,
          descripcion_larga_pt,
          direccion,
          ciudad,
          provincia,
          pais,
          zona,
          tipo_comida,
          tipo_comida_en,
          tipo_comida_pt,
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
          horario_text_en,
          horario_text_pt,
          resena,
          resena_en,
          resena_pt,
          meta_title,
          meta_title_en,
          meta_title_pt,
          meta_description,
          meta_description_en,
          meta_description_pt,
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

    const data = rows.map((row) => ({
      id: row.id,
      // 👇 estos campos salen ya traducidos según lang
      nombre: pickTranslated(row, 'nombre', lang),
      slug: row.slug,
      descripcion_corta: pickTranslated(row, 'descripcion_corta', lang),
      descripcion_larga: pickTranslated(row, 'descripcion_larga', lang),
      direccion: row.direccion,
      ciudad: row.ciudad,
      provincia: row.provincia,
      pais: row.pais,
      zona: row.zona,
      tipo_comida: pickTranslated(row, 'tipo_comida', lang),
      rango_precios: row.rango_precios,
      estrellas: row.estrellas,
      moneda: row.moneda,
      es_destacado: row.es_destacado,
      sitio_web: row.sitio_web,
      instagram: row.instagram,
      facebook: row.facebook,
      url_imagen: row.url_imagen || row.imagen_principal,
      imagen_principal: row.imagen_principal,
      url_reserva: row.url_reserva,
      url_maps: row.url_maps,
      horario_text: pickTranslated(row, 'horario_text', lang),
      resena: pickTranslated(row, 'resena', lang),
      meta_title: pickTranslated(row, 'meta_title', lang),
      meta_description: pickTranslated(row, 'meta_description', lang),
      tiene_terraza: row.tiene_terraza,
      tiene_musica_vivo: row.tiene_musica_vivo,
      tiene_happy_hour: row.tiene_happy_hour,
    }))

    const origin = req.headers.get('origin')
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/bares/public:', err)
    const origin = req.headers.get('origin')

    return new NextResponse(err?.message || 'Error al obtener bares públicos', {
      status: 500,
      headers: getCorsHeaders(origin),
    })
  }
}
