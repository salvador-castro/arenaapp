import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth, requireAdmin } from '@/lib/auth'

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
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

// util simple para slug
function slugify (str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/admin/eventos (admin) con paginación y búsqueda
export async function GET (req: NextRequest) {
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

      const countResult = await db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM eventos
        WHERE
          LOWER(titulo) LIKE $1
          OR LOWER(COALESCE(nombre_lugar, '')) LIKE $1
          OR LOWER(COALESCE(ciudad, '')) LIKE $1
          OR LOWER(COALESCE(provincia, '')) LIKE $1
        `,
        [like]
      )
      total = countResult.rows[0]?.count ?? 0

      const result = await db.query(
        `
        SELECT
          id,
          titulo,
          slug,
          descripcion_corta,
          descripcion_larga,
          categoria,
          es_destacado,
          fecha_inicio,
          fecha_fin,
          es_todo_el_dia,
          lugar_id,
          nombre_lugar,
          direccion,
          ciudad,
          provincia,
          pais,
          lat,
          lng,
          es_gratuito,
          precio_desde,
          moneda,
          url_entradas,
          edad_minima,
          estado,
          visibilidad,
          published_at,
          imagen_principal,
          created_at,
          updated_at
        FROM eventos
        WHERE
          LOWER(titulo) LIKE $1
          OR LOWER(COALESCE(nombre_lugar, '')) LIKE $1
          OR LOWER(COALESCE(ciudad, '')) LIKE $1
          OR LOWER(COALESCE(provincia, '')) LIKE $1
        ORDER BY fecha_inicio DESC NULLS LAST, id DESC
        LIMIT $2 OFFSET $3
        `,
        [like, pageSize, offset]
      )

      rows = result.rows
    } else {
      const countResult = await db.query(
        'SELECT COUNT(*)::int AS count FROM eventos'
      )
      total = countResult.rows[0]?.count ?? 0

      const result = await db.query(
        `
        SELECT
          id,
          titulo,
          slug,
          descripcion_corta,
          descripcion_larga,
          categoria,
          es_destacado,
          fecha_inicio,
          fecha_fin,
          es_todo_el_dia,
          lugar_id,
          nombre_lugar,
          direccion,
          ciudad,
          provincia,
          pais,
          lat,
          lng,
          es_gratuito,
          precio_desde,
          moneda,
          url_entradas,
          edad_minima,
          estado,
          visibilidad,
          published_at,
          imagen_principal,
          created_at,
          updated_at
        FROM eventos
        ORDER BY fecha_inicio DESC NULLS LAST, id DESC
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
        totalPages
      }),
      {
        status: 200,
        headers: {
          ...corsBaseHeaders(),
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (err: any) {
    console.error('Error GET /api/admin/eventos:', err)

    if (
      err.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders()
      })
    }
    if (err.message === 'FORBIDDEN_NOT_ADMIN') {
      return new NextResponse('Prohibido', {
        status: 403,
        headers: corsBaseHeaders()
      })
    }

    return new NextResponse(err?.message || 'Error al obtener eventos', {
      status: 500,
      headers: corsBaseHeaders()
    })
  }
}

// POST /api/admin/eventos crear
export async function POST (req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const body = await req.json()

    const {
      titulo,
      descripcion_corta,
      descripcion_larga,
      categoria,
      es_destacado,
      fecha_inicio,
      fecha_fin,
      es_todo_el_dia,
      lugar_id,
      nombre_lugar,
      direccion,
      ciudad,
      provincia,
      pais,
      lat,
      lng,
      es_gratuito,
      precio_desde,
      moneda,
      url_entradas,
      edad_minima,
      estado,
      visibilidad,
      imagen_principal,
      meta_title,
      meta_description
    } = body

    if (!titulo || !fecha_inicio || !direccion || !ciudad || !imagen_principal) {
      return new NextResponse('Faltan campos obligatorios', {
        status: 400,
        headers: corsBaseHeaders()
      })
    }

    const slug = slugify(titulo)

    const db = await getDb()

    const insertResult = await db.query(
      `
      INSERT INTO eventos (
        titulo,
        slug,
        descripcion_corta,
        descripcion_larga,
        categoria,
        es_destacado,
        fecha_inicio,
        fecha_fin,
        es_todo_el_dia,
        lugar_id,
        nombre_lugar,
        direccion,
        ciudad,
        provincia,
        pais,
        lat,
        lng,
        es_gratuito,
        precio_desde,
        moneda,
        url_entradas,
        edad_minima,
        estado,
        visibilidad,
        imagen_principal,
        meta_title,
        meta_description
      )
      VALUES (
        $1,  $2,  $3,  $4,  $5,
        $6,  $7,  $8,  $9,  $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25,
        $26, $27, $28
      )
      RETURNING
        id,
        titulo,
        slug,
        descripcion_corta,
        descripcion_larga,
        categoria,
        es_destacado,
        fecha_inicio,
        fecha_fin,
        es_todo_el_dia,
        lugar_id,
        nombre_lugar,
        direccion,
        ciudad,
        provincia,
        pais,
        lat,
        lng,
        es_gratuito,
        precio_desde,
        moneda,
        url_entradas,
        edad_minima,
        estado,
        visibilidad,
        published_at,
        imagen_principal,
        meta_title,
        meta_description,
        created_at,
        updated_at
      `,
      [
        titulo,
        slug,
        descripcion_corta || null,
        descripcion_larga || null,
        categoria || 'OTROS',
        !!es_destacado,
        fecha_inicio,
        fecha_fin || null,
        !!es_todo_el_dia,
        lugar_id || null,
        nombre_lugar || null,
        direccion,
        ciudad,
        provincia || null,
        pais || 'Argentina',
        lat ?? null,
        lng ?? null,
        es_gratuito !== false,
        precio_desde ?? null,
        moneda || 'ARS',
        url_entradas || null,
        edad_minima ?? null,
        estado || 'DRAFT',
        visibilidad || 'PUBLICO',
        imagen_principal,
        meta_title || null,
        meta_description || null
      ]
    )

    const event = insertResult.rows[0] || null

    return new NextResponse(JSON.stringify(event), {
      status: 201,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error POST /api/admin/eventos:', err)

    if (
      err.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders()
      })
    }
    if (err.message === 'FORBIDDEN_NOT_ADMIN') {
      return new NextResponse('Prohibido', {
        status: 403,
        headers: corsBaseHeaders()
      })
    }

    return new NextResponse(err?.message || 'Error al crear evento', {
      status: 500,
      headers: corsBaseHeaders()
    })
  }
}
