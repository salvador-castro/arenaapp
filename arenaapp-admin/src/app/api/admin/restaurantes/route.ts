//C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\api\admin\restaurantes\route.ts
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
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // no alfanum => guion
    .replace(/^-+|-+$/g, '') // bordes
}

// GET todos (admin) con paginación y búsqueda
export async function GET(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const db = await getDb()

    const { searchParams } = new URL(req.url)

    const pageParam = searchParams.get('page') || '1'
    const pageSizeParam = searchParams.get('pageSize') || '10'
    const search = (searchParams.get('search') || '').trim().toLowerCase()

    const page = Math.max(1, Number(pageParam) || 1)
    const pageSize = Math.min(50, Math.max(1, Number(pageSizeParam) || 10)) // tope 50
    const offset = (page - 1) * pageSize

    let total = 0
    let rows: any[] = []

    if (search) {
      const like = `%${search}%`

      // total con filtro
      const countResult = await db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM restaurantes
        WHERE
          LOWER(nombre) LIKE $1
          OR LOWER(COALESCE(tipo_comida, '')) LIKE $1
          OR LOWER(COALESCE(zona, '')) LIKE $1
          OR LOWER(COALESCE(ciudad, '')) LIKE $1
        `,
        [like]
      )
      total = countResult.rows[0]?.count ?? 0

      // página con filtro
      const result = await db.query(
        `
        SELECT
          id,
          slug,
          nombre,
          tipo_comida,
          rango_precios,
          estrellas,
          zona,
          direccion,
          ciudad,
          provincia,
          pais,
          url_maps,
          horario_text,
          url_reserva,
          url_instagram,
          sitio_web,
          url_imagen,
          es_destacado,
          estado,
          resena,
          created_at,
          updated_at
        FROM restaurantes
        WHERE
          LOWER(nombre) LIKE $1
          OR LOWER(COALESCE(tipo_comida, '')) LIKE $1
          OR LOWER(COALESCE(zona, '')) LIKE $1
          OR LOWER(COALESCE(ciudad, '')) LIKE $1
        ORDER BY id ASC
        LIMIT $2 OFFSET $3
        `,
        [like, pageSize, offset]
      )

      rows = result.rows
    } else {
      // total sin filtro
      const countResult = await db.query(
        'SELECT COUNT(*)::int AS count FROM restaurantes'
      )
      total = countResult.rows[0]?.count ?? 0

      // página sin filtro
      const result = await db.query(
        `
        SELECT
          id,
          slug,
          nombre,
          tipo_comida,
          rango_precios,
          estrellas,
          zona,
          direccion,
          ciudad,
          provincia,
          pais,
          url_maps,
          horario_text,
          url_reserva,
          url_instagram,
          sitio_web,
          url_imagen,
          es_destacado,
          estado,
          resena,
          created_at,
          updated_at
        FROM restaurantes
        ORDER BY id ASC
        LIMIT $1 OFFSET $2
        `,
        [pageSize, offset]
      )

      rows = result.rows
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return new NextResponse(
      JSON.stringify({
        data: rows,
        page,
        pageSize,
        total,
        totalPages,
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
    console.error('Error GET /api/admin/restaurantes:', err)
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

    return new NextResponse(err?.message || 'Error al obtener restaurantes', {
      status: 500,
      headers: getCorsHeaders(origin),
    })
  }
}

// POST crear
export async function POST(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const body = await req.json()

    const {
      nombre,
      tipo_comida,
      rango_precios,
      estrellas,
      zona,
      direccion,
      ciudad,
      provincia,
      pais,
      url_maps,
      horario_text,
      url_reserva,
      url_instagram,
      sitio_web,
      url_imagen,
      es_destacado,
      estado,
      resena,
    } = body

    if (
      !nombre ||
      !tipo_comida ||
      rango_precios == null ||
      estrellas == null ||
      !zona ||
      !direccion ||
      !url_maps ||
      !horario_text ||
      !url_instagram ||
      !resena ||
      !url_imagen
    ) {
      const origin = req.headers.get('origin')
      return new NextResponse('Faltan campos obligatorios', {
        status: 400,
        headers: getCorsHeaders(origin),
      })
    }

    // Generar slug (aunque no lo uses en el front, la DB lo exige)
    const slug = slugify(nombre)

    const db = await getDb()

    const insertResult = await db.query(
      `
      INSERT INTO restaurantes (
        slug,
        nombre,
        tipo_comida,
        rango_precios,
        estrellas,
        zona,
        direccion,
        ciudad,
        provincia,
        pais,
        url_maps,
        horario_text,
        url_reserva,
        url_instagram,
        sitio_web,
        url_imagen,
        es_destacado,
        estado,
        resena
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19
      )
      RETURNING
        id,
        slug,
        nombre,
        tipo_comida,
        rango_precios,
        estrellas,
        zona,
        direccion,
        ciudad,
        provincia,
        pais,
        url_maps,
        horario_text,
        url_reserva,
        url_instagram,
        sitio_web,
        url_imagen,
        es_destacado,
        estado,
        resena,
        created_at,
        updated_at
      `,
      [
        slug, // 1
        nombre, // 2
        tipo_comida, // 3
        rango_precios, // 4
        estrellas, // 5
        zona, // 6
        direccion, // 7
        ciudad || null, // 8
        provincia || null, // 9
        pais || 'Uruguay', // 10 (default de la tabla)
        url_maps, // 11
        horario_text, // 12
        url_reserva || null, // 13
        url_instagram, // 14
        sitio_web || null, // 15
        url_imagen, // 16
        !!es_destacado, // 17
        estado || 'PUBLICADO', // 18
        resena, // 19
      ]
    )

    const restaurant = insertResult.rows[0] || null

    // ✨ Traducir automáticamente en background
    if (restaurant?.id) {
      autoTranslate('restaurantes', restaurant.id).catch((err) => {
        console.error('[POST /restaurantes] Error auto-traducción:', err)
      })
    }

    const origin = req.headers.get('origin')
    return new NextResponse(JSON.stringify(restaurant), {
      status: 201,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error POST /api/admin/restaurantes:', err)
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

    return new NextResponse(err?.message || 'Error al crear restaurante', {
      status: 500,
      headers: getCorsHeaders(origin),
    })
  }
}
