import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth, requireAdmin } from '@/lib/auth'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'

type ContextWithId = {
  params: Promise<{ id: string }>
}

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
      'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

// GET /api/admin/galerias/:id
export async function GET (
  req: NextRequest,
  context: ContextWithId
) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const { id } = await context.params
    const db = getDb()

    const result = await db.query(
      `
      SELECT
        id,
        nombre,
        slug,
        descripcion_corta,
        descripcion_larga,
        direccion,
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
      FROM galerias
      WHERE id = $1
      `,
      [id]
    )

    const galeria = result.rows[0]

    if (!galeria) {
      return new NextResponse('Galería no encontrada', {
        status: 404,
        headers: corsBaseHeaders()
      })
    }

    return new NextResponse(JSON.stringify(galeria), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/galerias/[id]:', err)

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

    return new NextResponse(err?.message || 'Error al obtener galería', {
      status: 500,
      headers: corsBaseHeaders()
    })
  }
}

// PUT /api/admin/galerias/:id
export async function PUT (
  req: NextRequest,
  context: ContextWithId
) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const { id } = await context.params
    const body = await req.json()

    const {
      nombre,
      descripcion_corta,
      descripcion_larga,
      direccion,
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

    // Campos mínimos requeridos
    if (
      !nombre ||
      !direccion ||
      !ciudad ||
      !instagram ||
      !imagen_principal
    ) {
      return new NextResponse('Faltan campos obligatorios', {
        status: 400,
        headers: corsBaseHeaders()
      })
    }

    const db = getDb()

    await db.query(
      `
      UPDATE galerias
      SET
        nombre = $1,
        descripcion_corta = $2,
        descripcion_larga = $3,
        direccion = $4,
        ciudad = $5,
        provincia = $6,
        pais = $7,
        lat = $8,
        lng = $9,
        telefono = $10,
        email_contacto = $11,
        sitio_web = $12,
        instagram = $13,
        facebook = $14,
        anio_fundacion = $15,
        tiene_entrada_gratuita = $16,
        requiere_reserva = $17,
        horario_desde = $18,
        horario_hasta = $19,
        imagen_principal = $20,
        meta_title = $21,
        meta_description = $22,
        estado = $23,
        updated_at = now()
      WHERE id = $24
      `,
      [
        nombre,
        descripcion_corta || null,
        descripcion_larga || null,
        direccion,
        ciudad,
        provincia || null,
        pais || 'Uruguay',
        lat ?? null,
        lng ?? null,
        telefono || null,
        email_contacto || null,
        sitio_web || null,
        instagram,
        facebook || null,
        anio_fundacion ?? null,
        !!tiene_entrada_gratuita,
        !!requiere_reserva,
        horario_desde || null,
        horario_hasta || null,
        imagen_principal,
        meta_title || null,
        meta_description || null,
        estado || 'PUBLICADO',
        id
      ]
    )

    const result = await db.query(
      `
      SELECT
        id,
        nombre,
        slug,
        descripcion_corta,
        descripcion_larga,
        direccion,
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
      FROM galerias
      WHERE id = $1
      `,
      [id]
    )

    const galeria = result.rows[0]

    return new NextResponse(JSON.stringify(galeria), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error PUT /api/admin/galerias/[id]:', err)

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
      err?.message || 'Error al actualizar galería',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}

// DELETE /api/admin/galerias/:id
export async function DELETE (
  req: NextRequest,
  context: ContextWithId
) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const { id } = await context.params
    const db = getDb()

    await db.query('DELETE FROM galerias WHERE id = $1', [id])

    return new NextResponse(null, {
      status: 204,
      headers: corsBaseHeaders()
    })
  } catch (err: any) {
    console.error('Error DELETE /api/admin/galerias/[id]:', err)

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
      err?.message || 'Error al eliminar galería',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}
