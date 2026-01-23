import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth, requireAdmin } from '@/lib/auth'
import { autoTranslate } from '@/lib/translateHelper'

import { getCorsHeaders } from '@/lib/cors'

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(origin),
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// util simple para slug
function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// GET /api/admin/galerias
export async function GET(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const db = await getDb()
    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get('page') ?? '1')
    const pageSize = Number(searchParams.get('pageSize') ?? '10')
    const search = (searchParams.get('search') ?? '').trim()

    const offset = (page - 1) * pageSize

    const where: string[] = []
    const values: any[] = []

    if (search) {
      where.push(
        `(nombre ILIKE $${values.length + 1} OR ciudad ILIKE $${values.length + 1} OR provincia ILIKE $${values.length + 1} OR zona ILIKE $${values.length + 1})`
      )
      values.push(`%${search}%`)
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const countResult = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM galerias
      ${whereSql}
      `,
      values
    )

    const total = Number(countResult.rows[0]?.total ?? 0)

    const dataResult = await db.query(
      `
      SELECT
        id,
        nombre,
        direccion,
        ciudad,
        provincia,
        pais,
        zona,
        instagram,
        sitio_web,
        anio_fundacion,
        tiene_entrada_gratuita,
        requiere_reserva,
        estrellas,
        es_destacado,
        estado,
        created_at,
        updated_at
      FROM galerias
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
      `,
      [...values, pageSize, offset]
    )

    return new NextResponse(
      JSON.stringify({
        data: dataResult.rows,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      }),
      {
        status: 200,
        headers: {
          ...getCorsHeaders(req.headers.get('origin')),
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (err: any) {
    console.error('Error GET /api/admin/galerias:', err)
    const origin = req.headers.get('origin')

    if (
      err.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: getCorsHeaders(origin),
      })
    }
    if (err.message === 'FORBIDDEN_NOT_ADMIN') {
      return new NextResponse('Prohibido', {
        status: 403,
        headers: getCorsHeaders(origin),
      })
    }

    return new NextResponse(err?.message || 'Error al obtener galerías', {
      status: 500,
      headers: getCorsHeaders(origin),
    })
  }
}

// POST /api/admin/galerias
export async function POST(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const body = await req.json()

    const {
      nombre,
      resena,
      direccion,
      zona,
      ciudad,
      provincia,
      pais,
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
      meta_title,
      meta_description,
      es_destacado,
      estado,
      estrellas,
      nombre_muestra,
      artistas,
      fecha_inauguracion,
      hora_inauguracion,
    } = body

    // Obligatorios: nombre, dirección, reseña, imagen
    if (!nombre || !direccion || !resena || !url_imagen) {
      return new NextResponse('Faltan campos obligatorios', {
        status: 400,
        headers: getCorsHeaders(req.headers.get('origin')),
      })
    }

    const db = await getDb()
    const slug = slugify(nombre)

    const insertResult = await db.query(
      `
      INSERT INTO galerias (
        nombre,
        slug,
        descripcion_corta,
        resena,
        direccion,
        zona,
        ciudad,
        provincia,
        pais,
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
        meta_title,
        meta_description,
        es_destacado,
        estado,
        estrellas,
        nombre_muestra,
        artistas,
        fecha_inauguracion,
        hora_inauguracion
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25,
        $26, $27, $28, $29, $30, $31
      )
      RETURNING
        id,
        nombre,
        slug,
        descripcion_corta,
        resena,
        direccion,
        zona,
        ciudad,
        provincia,
        pais,
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
        estrellas,
        meta_title,
        meta_description,
        es_destacado,
        estado,
        created_at,
        updated_at,
        nombre_muestra,
        artistas,
        fecha_inauguracion,
        hora_inauguracion
      `,
      [
        nombre, // $1
        slug, // $2
        resena ? String(resena).slice(0, 200) : null, // $3 -> descripcion_corta auto
        resena || null, // $4
        direccion, // $5
        zona || null, // $6
        ciudad || null, // $7
        provincia || null, // $8
        pais || 'Uruguay', // $9
        lat === undefined || lat === null ? null : lat, // $10
        lng === undefined || lng === null ? null : lng, // $11
        telefono || null, // $12
        email_contacto || null, // $13
        sitio_web || null, // $14
        instagram || null, // $15
        facebook || null, // $16
        anio_fundacion ?? null, // $17
        !!tiene_entrada_gratuita, // $18
        !!requiere_reserva, // $19
        horario_desde || null, // $20
        horario_hasta || null, // $21
        url_imagen, // $22
        meta_title || null, // $23
        meta_description || null, // $24
        !!es_destacado, // $25
        estado || 'PUBLICADO', // $26
        estrellas ? Number(estrellas) : null, // $27
        nombre_muestra || null, // $28
        artistas || null, // $29
        fecha_inauguracion || null, // $30
        hora_inauguracion || null // $31
      ]
    )

    const galeria = insertResult.rows[0]

    // ✨ Traducir automáticamente en background
    if (galeria?.id) {
      autoTranslate('galerias', galeria.id).catch((err) => {
        console.error('[POST /galerias] Error auto-traducción:', err)
      })
    }

    const origin = req.headers.get('origin')
    return new NextResponse(JSON.stringify(galeria), {
      status: 201,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error POST /api/admin/galerias:', err)
    const origin = req.headers.get('origin')

    if (
      err.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: getCorsHeaders(origin),
      })
    }
    if (err.message === 'FORBIDDEN_NOT_ADMIN') {
      return new NextResponse('Prohibido', {
        status: 403,
        headers: getCorsHeaders(origin),
      })
    }

    return new NextResponse(err?.message || 'Error al crear galería', {
      status: 500,
      headers: getCorsHeaders(origin),
    })
  }
}
