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
    // Generar slug desde nombre_muestra (o nombre como fallback)
    const slugify = (str: string): string => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    }
    const slug = slugify(nombre_muestra || nombre)

    await db.query(
      `
      UPDATE galerias
      SET
        nombre = $1,
        slug = $2,
        descripcion_corta = $3,
        resena = $4,
        direccion = $5,
        zona = $6,
        ciudad = $7,
        provincia = $8,
        pais = $9,
        lat = $10,
        lng = $11,
        telefono = $12,
        email_contacto = $13,
        sitio_web = $14,
        instagram = $15,
        facebook = $16,
        anio_fundacion = $17,
        tiene_entrada_gratuita = $18,
        requiere_reserva = $19,
        horario_desde = $20,
        horario_hasta = $21,
        url_imagen = $22,
        url_maps = $23,
        meta_title = $24,
        meta_description = $25,
        es_destacado = $26,
        estado = $27,
        estrellas = $28,
        nombre_muestra = $29,
        artistas = $30,
        fecha_inauguracion = $31,
        hora_inauguracion = $32,
        updated_at = now()
      WHERE id = $33
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
        url_maps || null, // $23
        meta_title || null, // $24
        meta_description || null, // $25
        !!es_destacado, // $26
        estado || 'PUBLICADO', // $27
        estrellas ? Number(estrellas) : null, // $28
        nombre_muestra || null, // $29
        artistas || null, // $30
        fecha_inauguracion || null, // $31
        hora_inauguracion || null, // $32
        id, // $33
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
