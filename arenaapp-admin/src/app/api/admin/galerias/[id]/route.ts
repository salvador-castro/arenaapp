import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth, requireAdmin } from '@/lib/auth'
import { autoTranslate } from '@/lib/translateHelper'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'

type ContextWithId = {
  params: Promise<{ id: string }>
}

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
      'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// GET /api/admin/galerias/:id
// GET /api/admin/galerias/:id
export async function GET(req: NextRequest, context: ContextWithId) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const { id } = await context.params
    const db = await getDb()

    const result = await db.query(
      `
      SELECT *
      FROM galerias
      WHERE id = $1
      `,
      [id]
    )

    const galeria = result.rows[0]

    if (!galeria) {
      return new NextResponse('Galería no encontrada', {
        status: 404,
        headers: corsBaseHeaders(),
      })
    }

    return new NextResponse(JSON.stringify(galeria), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/galerias/[id]:', err)

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

    return new NextResponse(err?.message || 'Error al obtener galería', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}

// PUT /api/admin/galerias/:id
export async function PUT(req: NextRequest, context: ContextWithId) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const { id } = await context.params
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
    } = body

    // Obligatorios
    if (!nombre || !direccion || !resena || !url_imagen) {
      return new NextResponse('Faltan campos obligatorios', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    const db = await getDb()

    await db.query(
      `
      UPDATE galerias
      SET
        nombre = $1,
        descripcion_corta = $2,
        resena = $3,
        direccion = $4,
        zona = $5,
        ciudad = $6,
        provincia = $7,
        pais = $8,
        lat = $9,
        lng = $10,
        telefono = $11,
        email_contacto = $12,
        sitio_web = $13,
        instagram = $14,
        facebook = $15,
        anio_fundacion = $16,
        tiene_entrada_gratuita = $17,
        requiere_reserva = $18,
        horario_desde = $19,
        horario_hasta = $20,
        url_imagen = $21,
        meta_title = $22,
        meta_description = $23,
        es_destacado = $24,
        estado = $25,
        estrellas = $26,
        updated_at = now()
      WHERE id = $27
      `,
      [
        nombre, // $1
        resena ? String(resena).slice(0, 200) : null, // $2 -> descripcion_corta auto
        resena || null, // $3
        direccion, // $4
        zona || null, // $5
        ciudad || null, // $6
        provincia || null, // $7
        pais || 'Uruguay', // $8
        lat === undefined || lat === null ? null : lat, // $9
        lng === undefined || lng === null ? null : lng, // $10
        telefono || null, // $11
        email_contacto || null, // $12
        sitio_web || null, // $13
        instagram || null, // $14
        facebook || null, // $15
        anio_fundacion ?? null, // $16
        !!tiene_entrada_gratuita, // $17
        !!requiere_reserva, // $18
        horario_desde || null, // $19
        horario_hasta || null, // $20
        url_imagen, // $21
        meta_title || null, // $22
        meta_description || null, // $23
        !!es_destacado, // $24
        estado || 'PUBLICADO', // $25
        estrellas ? Number(estrellas) : null, // $26
        id, // $27
      ]
    )

    const result = await db.query(
      `
      SELECT
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
        updated_at
      FROM galerias
      WHERE id = $1
      `,
      [id]
    )

    const galeria = result.rows[0]

    // ✨ Traducir automáticamente en background
    if (galeria?.id) {
      autoTranslate('galerias', Number(galeria.id)).catch((err) => {
        console.error('[PUT /galerias/:id] Error auto-traducción:', err)
      })
    }

    return new NextResponse(JSON.stringify(galeria), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error PUT /api/admin/galerias/[id]:', err)

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

    return new NextResponse(err?.message || 'Error al actualizar galería', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}

// DELETE /api/admin/galerias/:id
export async function DELETE(req: NextRequest, context: ContextWithId) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const { id } = await context.params
    const db = await getDb()

    await db.query('DELETE FROM galerias WHERE id = $1', [id])

    return new NextResponse(null, {
      status: 204,
      headers: corsBaseHeaders(),
    })
  } catch (err: any) {
    console.error('Error DELETE /api/admin/galerias/[id]:', err)

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

    return new NextResponse(err?.message || 'Error al eliminar galería', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}
