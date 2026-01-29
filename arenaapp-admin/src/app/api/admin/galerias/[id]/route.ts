import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth, requireAdmin } from '@/lib/auth'
import { autoTranslate } from '@/lib/translateHelper'

import { getCorsHeaders } from '@/lib/cors'

type ContextWithId = {
  params: Promise<{ id: string }>
}

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(origin),
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
      const origin = req.headers.get('origin')
      return new NextResponse('Galería no encontrada', {
        status: 404,
        headers: getCorsHeaders(origin),
      })
    }

    const origin = req.headers.get('origin')
    return new NextResponse(JSON.stringify(galeria), {
      status: 200,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/galerias/[id]:', err)
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

    return new NextResponse(err?.message || 'Error al obtener galería', {
      status: 500,
      headers: getCorsHeaders(origin),
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
      url_maps,
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

    // Obligatorios
    if (!nombre || !direccion || !resena || !url_imagen) {
      return new NextResponse('Faltan campos obligatorios', {
        status: 400,
        headers: getCorsHeaders(req.headers.get('origin')),
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
        url_maps = $22,
        meta_title = $23,
        meta_description = $24,
        es_destacado = $25,
        estado = $26,
        estrellas = $27,
        nombre_muestra = $28,
        artistas = $29,
        fecha_inauguracion = $30,
        hora_inauguracion = $31,
        updated_at = now()
      WHERE id = $32
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
        url_maps || null, // $22
        meta_title || null, // $23
        meta_description || null, // $24
        !!es_destacado, // $25
        estado || 'PUBLICADO', // $26
        estrellas ? Number(estrellas) : null, // $27
        nombre_muestra || null, // $28
        artistas || null, // $29
        fecha_inauguracion || null, // $30
        hora_inauguracion || null, // $31
        id, // $32
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
        url_maps,
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

    const origin = req.headers.get('origin')
    return new NextResponse(JSON.stringify(galeria), {
      status: 200,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error PUT /api/admin/galerias/[id]:', err)
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

    return new NextResponse(err?.message || 'Error al actualizar galería', {
      status: 500,
      headers: getCorsHeaders(origin),
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

    const origin = req.headers.get('origin')
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    })
  } catch (err: any) {
    console.error('Error DELETE /api/admin/galerias/[id]:', err)
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

    return new NextResponse(err?.message || 'Error al eliminar galería', {
      status: 500,
      headers: getCorsHeaders(origin),
    })
  }
}
