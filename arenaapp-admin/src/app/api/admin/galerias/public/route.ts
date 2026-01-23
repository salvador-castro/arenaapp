///Users/salvacastro/Desktop/arenaapp/arenaapp-admin/src/app/api/admin/galerias/public/route.ts
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

// GET /api/admin/galerias/public  (público, solo PUBLICADO)
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
        SELECT *
        FROM galerias
        WHERE estado = 'PUBLICADO'
        ORDER BY
          es_destacado DESC,
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
      resena: pickTranslated(row, 'resena', lang),
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
      anio_fundacion: row.anio_fundacion,
      tiene_entrada_gratuita: row.tiene_entrada_gratuita,
      requiere_reserva: row.requiere_reserva,
      horario_desde: row.horario_desde,
      horario_hasta: row.horario_hasta,
      url_imagen: row.url_imagen,
      estrellas: row.estrellas,
      es_destacado: row.es_destacado,
      estado: row.estado,
      meta_title: pickTranslated(row, 'meta_title', lang),
      meta_description: pickTranslated(row, 'meta_description', lang),
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Nuevos campos
      nombre_muestra: pickTranslated(row, 'nombre_muestra', lang), // Support translation if needed, or just row.nombre_muestra
      artistas: row.artistas,
      fecha_inauguracion: row.fecha_inauguracion,
      hora_inauguracion: row.hora_inauguracion,
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
    console.error('Error GET /api/admin/galerias/public:', err)
    const origin = req.headers.get('origin')

    return new NextResponse(
      err?.message || 'Error al obtener galerías públicas',
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    )
  }
}
