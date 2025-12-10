import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth, requireAdmin } from '@/lib/auth'

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
    .replace(/^-+|-+$/g, '')
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
    const pageSize = Math.min(50, Math.max(1, Number(pageSizeParam) || 10))
    const offset = (page - 1) * pageSize

    let total = 0
    let rows: any[] = []

    if (search) {
      const like = `%${search}%`

      // total con filtro
      const countResult = await db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM shopping
        WHERE
          LOWER(nombre) LIKE $1
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
          rango_precios,
          estrellas,
          zona,
          direccion,
          ciudad,
          provincia,
          pais,
          horario_text,
          sitio_web,
          url_imagen,
          cantidad_locales,
          tiene_estacionamiento,
          tiene_patio_comidas,
          tiene_cine,
          es_outlet,
          es_destacado,
          telefono,
          instagram,
          facebook,
          estado,
          resena,
          created_at,
          updated_at
        FROM shopping
        WHERE
          LOWER(nombre) LIKE $1
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
        'SELECT COUNT(*)::int AS count FROM shopping'
      )
      total = countResult.rows[0]?.count ?? 0

      // página sin filtro
      const result = await db.query(
        `
        SELECT
          id,
          slug,
          nombre,
          rango_precios,
          estrellas,
          zona,
          direccion,
          ciudad,
          provincia,
          pais,
          horario_text,
          sitio_web,
          url_imagen,
          cantidad_locales,
          tiene_estacionamiento,
          tiene_patio_comidas,
          tiene_cine,
          es_outlet,
          es_destacado,
          telefono,
          instagram,
          facebook,
          estado,
          resena,
          created_at,
          updated_at
        FROM shopping
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
          ...corsBaseHeaders(),
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (err: any) {
    console.error('Error GET /api/admin/shopping:', err)

    if (
      err.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders(),
      })
    }
    if (err.message === 'FORBIDDEN_NOT_ADMIN') {
      return new NextResponse('Prohibido', {
        status: 403,
        headers: corsBaseHeaders(),
      })
    }

    return new NextResponse(err?.message || 'Error al obtener shoppings', {
      status: 500,
      headers: corsBaseHeaders(),
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
      rango_precios,
      estrellas,
      zona,
      direccion,
      ciudad,
      provincia,
      pais,
      horario_text,
      sitio_web,
      url_imagen,
      cantidad_locales,
      tiene_estacionamiento,
      tiene_patio_comidas,
      tiene_cine,
      es_outlet,
      es_destacado,
      telefono,
      instagram,
      facebook,
      estado,
      resena,
    } = body

    if (
      !nombre ||
      rango_precios == null ||
      estrellas == null ||
      !zona ||
      !direccion ||
      !horario_text ||
      !resena ||
      !url_imagen
    ) {
      return new NextResponse('Faltan campos obligatorios', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    // Generar slug
    const slug = slugify(nombre)

    const db = await getDb()

    const insertResult = await db.query(
      `
      INSERT INTO shopping (
        slug,
        nombre,
        rango_precios,
        estrellas,
        zona,
        direccion,
        ciudad,
        provincia,
        pais,
        horario_text,
        sitio_web,
        url_imagen,
        cantidad_locales,
        tiene_estacionamiento,
        tiene_patio_comidas,
        tiene_cine,
        es_outlet,
        es_destacado,
        telefono,
        instagram,
        facebook,
        estado,
        resena
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23
      )
      RETURNING
        id,
        slug,
        nombre,
        rango_precios,
        estrellas,
        zona,
        direccion,
        ciudad,
        provincia,
        pais,
        horario_text,
        sitio_web,
        url_imagen,
        cantidad_locales,
        tiene_estacionamiento,
        tiene_patio_comidas,
        tiene_cine,
        es_outlet,
        es_destacado,
        telefono,
        instagram,
        facebook,
        estado,
        resena,
        created_at,
        updated_at
      `,
      [
        slug, // 1
        nombre, // 2
        rango_precios, // 3
        estrellas, // 4
        zona, // 5
        direccion, // 6
        ciudad || null, // 7
        provincia || null, // 8
        pais || 'Argentina', // 9
        horario_text, // 10
        sitio_web || null, // 11
        url_imagen, // 12
        cantidad_locales ?? null, // 13
        !!tiene_estacionamiento, // 14
        !!tiene_patio_comidas, // 15
        !!tiene_cine, // 16
        !!es_outlet, // 17
        !!es_destacado, // 18
        telefono || null, // 19
        instagram || null, // 20
        facebook || null, // 21
        estado || 'PUBLICADO', // 22
        resena, // 23
      ]
    )

    const shopping = insertResult.rows[0] || null

    return new NextResponse(JSON.stringify(shopping), {
      status: 201,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error POST /api/admin/shopping:', err)

    if (
      err.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders(),
      })
    }
    if (err.message === 'FORBIDDEN_NOT_ADMIN') {
      return new NextResponse('Prohibido', {
        status: 403,
        headers: corsBaseHeaders(),
      })
    }

    return new NextResponse(err?.message || 'Error al crear shopping', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}
