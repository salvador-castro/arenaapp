// src/app/api/admin/shopping/public/route.ts
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

// GET /api/admin/shopping/public  (público, solo PUBLICADO)
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
        FROM shopping
        WHERE
          estado = 'PUBLICADO'
          AND (
            LOWER(nombre) LIKE $1
            OR LOWER(COALESCE(zona, '')) LIKE $1
            OR LOWER(COALESCE(ciudad, '')) LIKE $1
          )
        ORDER BY
          es_destacado DESC,
          estrellas DESC NULLS LAST,
          nombre ASC
        `,
        [like]
      )
      rows = result.rows
    } else {
      const result = await db.query(
        `
        SELECT *
        FROM shopping
        WHERE estado = 'PUBLICADO'
        ORDER BY
          es_destacado DESC,
          estrellas DESC NULLS LAST,
          nombre ASC
        `
      )
      rows = result.rows
    }

    const data = rows.map((row) => ({
      id: row.id,
      nombre: pickTranslated(row, 'nombre', lang),
      slug: row.slug,
      descripcion_corta: pickTranslated(row, 'descripcion_corta', lang),
      descripcion_larga: pickTranslated(row, 'descripcion_larga', lang),
      direccion: row.direccion,
      ciudad: row.ciudad,
      provincia: row.provincia,
      pais: row.pais,
      zona: row.zona,
      lat: row.lat,
      lng: row.lng,
      telefono: row.telefono,
      email_contacto: row.email_contacto,
      sitio_web: row.sitio_web,
      instagram: row.instagram,
      facebook: row.facebook,
      rango_precios: row.rango_precios,
      moneda: row.moneda,
      cantidad_locales: row.cantidad_locales,
      tiene_estacionamiento: row.tiene_estacionamiento,
      tiene_patio_comidas: row.tiene_patio_comidas,
      tiene_cine: row.tiene_cine,
      es_outlet: row.es_outlet,
      horario_desde: row.horario_desde,
      horario_hasta: row.horario_hasta,
      horario_text: pickTranslated(row, 'horario_text', lang),
      imagen_principal: row.imagen_principal,
      url_imagen: row.url_imagen,
      estrellas: row.estrellas,
      resena: pickTranslated(row, 'resena', lang),
      es_destacado: row.es_destacado,
      estado: row.estado,
      meta_title: pickTranslated(row, 'meta_title', lang),
      meta_description: pickTranslated(row, 'meta_description', lang),
      created_at: row.created_at,
      updated_at: row.updated_at,
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
    console.error('Error GET /api/admin/shopping/public:', err)
    const origin = req.headers.get('origin')

    return new NextResponse(
      err?.message || 'Error al obtener shopping públicos',
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    )
  }
}
