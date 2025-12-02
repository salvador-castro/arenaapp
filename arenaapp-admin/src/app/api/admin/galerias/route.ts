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
    .replace(/(^-|-$)+/g, '')
}

// GET /api/admin/galerias
export async function GET (req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const db = getDb()
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
        totalPages: Math.max(1, Math.ceil(total / pageSize))
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
    console.error('Error GET /api/admin/galerias:', err)

    if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === 'UNAUTHORIZED_INVALID_TOKEN') {
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

    return new NextResponse(
      err?.message || 'Error al obtener galerías',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}

// POST /api/admin/galerias
export async function POST (req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const body = await req.json()

    const {
      nombre,
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
      imagen_principal,
      meta_title,
      meta_description,
      estado
    } = body

    // Obligatorios: nombre+, direccion+, descripcion_corta+, imagen+
    if (
      !nombre ||
      !direccion ||
      !descripcion_corta ||
      !imagen_principal
    ) {
      return new NextResponse('Faltan campos obligatorios', {
        status: 400,
        headers: corsBaseHeaders()
      })
    }

    const db = getDb()
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
        imagen_principal,
        meta_title,
        meta_description,
        estado
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25
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
        imagen_principal,
        meta_title,
        meta_description,
        estado,
        created_at,
        updated_at
      `,
      [
        nombre,
        slug,
        descripcion_corta || null,
        resena || null,
        direccion,
        zona || null,
        ciudad || null,
        provincia || null,
        pais || 'Uruguay',
        lat === undefined || lat === null ? null : lat,
        lng === undefined || lng === null ? null : lng,
        telefono || null,
        email_contacto || null,
        sitio_web || null,
        instagram || null,
        facebook || null,
        anio_fundacion ?? null,
        !!tiene_entrada_gratuita,
        !!requiere_reserva,
        horario_desde || null,
        horario_hasta || null,
        imagen_principal,
        meta_title || null,
        meta_description || null,
        estado || 'PUBLICADO'
      ]
    )

    const galeria = insertResult.rows[0]

    return new NextResponse(JSON.stringify(galeria), {
      status: 201,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error POST /api/admin/galerias:', err)

    if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === 'UNAUTHORIZED_INVALID_TOKEN') {
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

    return new NextResponse(
      err?.message || 'Error al crear galería',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}
