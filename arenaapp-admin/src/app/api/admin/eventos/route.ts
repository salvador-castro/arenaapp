// C:\Users\salvaCastro\Desktop\arenaapp-admin\src\app\api\admin\eventos\route.ts
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

// ========= GET lista (admin, con paginación y búsqueda) =========
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

      const countResult = await db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM eventos
        WHERE
          LOWER(titulo) LIKE $1
          OR LOWER(COALESCE(categoria::text, '')) LIKE $1
          OR LOWER(COALESCE(zona, '')) LIKE $1
          OR LOWER(COALESCE(direccion, '')) LIKE $1
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
          categoria,
          es_destacado,
          fecha_inicio,
          fecha_fin,
          es_todo_el_dia,
          zona,
          direccion,
          es_gratuito,
          precio_desde,
          moneda,
          url_entradas,
          estado,
          visibilidad,
          resena,
          imagen_principal,
          created_at,
          updated_at
        FROM eventos
        WHERE
          LOWER(titulo) LIKE $1
          OR LOWER(COALESCE(categoria::text, '')) LIKE $1
          OR LOWER(COALESCE(zona, '')) LIKE $1
          OR LOWER(COALESCE(direccion, '')) LIKE $1
        ORDER BY fecha_inicio ASC, id ASC
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
          categoria,
          es_destacado,
          fecha_inicio,
          fecha_fin,
          es_todo_el_dia,
          zona,
          direccion,
          es_gratuito,
          precio_desde,
          moneda,
          url_entradas,
          estado,
          visibilidad,
          resena,
          imagen_principal,
          created_at,
          updated_at
        FROM eventos
        ORDER BY fecha_inicio ASC, id ASC
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
    console.error('Error GET /api/admin/eventos:', err)

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

    return new NextResponse(err?.message || 'Error al obtener eventos', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}

// ========= POST crear evento =========
export async function POST(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const body = await req.json()

    const {
      titulo,
      categoria,
      zona,
      direccion,
      es_gratuito,
      precio_desde,
      moneda,
      url_entradas,
      estado,
      fecha_inicio,
      fecha_fin,
      es_todo_el_dia,
      es_destacado,
      resena,
      imagen_principal,
    } = body

    // ===== Validaciones de obligatorios =====
    if (!titulo) {
      return new NextResponse('El título es obligatorio', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    if (!categoria) {
      return new NextResponse('La categoría es obligatoria', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    if (!zona || (Array.isArray(zona) && zona.length === 0)) {
      return new NextResponse('La zona es obligatoria', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    if (!direccion) {
      return new NextResponse('La dirección es obligatoria', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    if (typeof es_gratuito !== 'boolean') {
      return new NextResponse('El campo "es_gratuito" es obligatorio', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    if (!url_entradas) {
      return new NextResponse('La URL de entradas es obligatoria', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    if (!estado) {
      return new NextResponse('El estado es obligatorio', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    if (!fecha_inicio) {
      return new NextResponse('La fecha de inicio es obligatoria', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    // precio_desde solo obligatorio si NO es gratuito
    let precioDesdeValue: number | null = null
    if (es_gratuito) {
      precioDesdeValue = null
    } else {
      if (precio_desde == null || precio_desde === '') {
        return new NextResponse(
          'El campo "Precio desde" es obligatorio si el evento no es gratuito',
          {
            status: 400,
            headers: corsBaseHeaders(),
          }
        )
      }
      precioDesdeValue = Number(precio_desde)
    }

    const zonaValue =
      Array.isArray(zona) && zona.length > 0 ? zona.join(', ') : zona || null

    const monedaValue = (moneda || 'URU') as string
    const estadoValue = estado || 'PUBLICADO'
    const esDestacadoValue = !!es_destacado
    const esTodoElDiaValue = !!es_todo_el_dia

    const slug = slugify(titulo)

    const db = await getDb()

    const insertResult = await db.query(
      `
      INSERT INTO eventos (
        titulo,
        slug,
        categoria,
        es_destacado,
        fecha_inicio,
        fecha_fin,
        es_todo_el_dia,
        zona,
        direccion,
        es_gratuito,
        precio_desde,
        moneda,
        url_entradas,
        estado,
        resena,
        imagen_principal
      )
      VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9,
        $10, $11, $12,
        $13, $14,
        $15, $16
      )
      RETURNING
        id,
        titulo,
        slug,
        categoria,
        es_destacado,
        fecha_inicio,
        fecha_fin,
        es_todo_el_dia,
        zona,
        direccion,
        es_gratuito,
        precio_desde,
        moneda,
        url_entradas,
        estado,
        visibilidad,
        resena,
        imagen_principal,
        created_at,
        updated_at
      `,
      [
        titulo, // 1
        slug, // 2
        categoria, // 3
        esDestacadoValue, // 4
        fecha_inicio, // 5
        fecha_fin || null, // 6
        esTodoElDiaValue, // 7
        zonaValue, // 8
        direccion, // 9
        es_gratuito, // 10
        precioDesdeValue, // 11
        monedaValue, // 12
        url_entradas, // 13
        estadoValue, // 14
        resena || null, // 15
        imagen_principal || null, // 16
      ]
    )

    const evento = insertResult.rows[0] || null

    return new NextResponse(JSON.stringify(evento), {
      status: 201,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error POST /api/admin/eventos:', err)

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

    return new NextResponse(err?.message || 'Error al crear evento', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}
