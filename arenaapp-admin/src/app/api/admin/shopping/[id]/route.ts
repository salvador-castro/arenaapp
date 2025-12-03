//C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\api\admin\shopping\[id]\route.ts

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

// GET /api/admin/shopping/:id
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
        telefono,
        instagram,
        facebook,
        estado,
        resena,
        created_at,
        updated_at
      FROM shopping
      WHERE id = $1
      `,
      [id]
    )

    const shopping = result.rows[0]

    if (!shopping) {
      return new NextResponse('Shopping no encontrado', {
        status: 404,
        headers: corsBaseHeaders()
      })
    }

    return new NextResponse(JSON.stringify(shopping), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/shopping/[id]:', err)

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

    return new NextResponse(err?.message || 'Error al obtener shopping', {
      status: 500,
      headers: corsBaseHeaders()
    })
  }
}

// PUT /api/admin/shopping/:id
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
        headers: corsBaseHeaders()
      })
    }

    const db = getDb()

    await db.query(
      `
      UPDATE shopping
SET
  nombre = $1,
  rango_precios = $2,
  estrellas = $3,
  zona = $4,
  direccion = $5,
  ciudad = $6,
  provincia = $7,
  pais = $8,
  horario_text = $9,
  sitio_web = $10,
  url_imagen = $11,
  cantidad_locales = $12,
  tiene_estacionamiento = $13,
  tiene_patio_comidas = $14,
  tiene_cine = $15,
  es_outlet = $16,
  es_destacado = $17,      // 👈
  telefono = $18,
  instagram = $19,
  facebook = $20,
  estado = $21,
  resena = $22
WHERE id = $23

      `,
      [
  nombre,                   // 1
  rango_precios,            // 2
  estrellas,                // 3
  zona,                     // 4
  direccion,                // 5
  ciudad || null,           // 6
  provincia || null,        // 7
  pais || 'Argentina',      // 8
  horario_text,             // 9
  sitio_web || null,        // 10
  url_imagen,               // 11
  cantidad_locales ?? null, // 12
  !!tiene_estacionamiento,  // 13
  !!tiene_patio_comidas,    // 14
  !!tiene_cine,             // 15
  !!es_outlet,              // 16
  !!es_destacado,           // 17
  telefono || null,         // 18
  instagram || null,        // 19
  facebook || null,         // 20
  estado || 'PUBLICADO',    // 21
  resena,                   // 22
  id                        // 23
]
    )

    const result = await db.query(
      `
      SELECT
        id,
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
        telefono,
        instagram,
        facebook,
        estado,
        resena,
        created_at,
        updated_at
      FROM shopping
      WHERE id = $1
      `,
      [id]
    )

    const shopping = result.rows[0]

    return new NextResponse(JSON.stringify(shopping), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    console.error('Error PUT /api/admin/shopping/[id]:', err)

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
      err?.message || 'Error al actualizar shopping',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}

// DELETE /api/admin/shopping/:id
export async function DELETE (
  req: NextRequest,
  context: ContextWithId
) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const { id } = await context.params
    const db = getDb()

    await db.query('DELETE FROM shopping WHERE id = $1', [id])

    return new NextResponse(null, {
      status: 204,
      headers: corsBaseHeaders()
    })
  } catch (err: any) {
    console.error('Error DELETE /api/admin/shopping/[id]:', err)

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
      err?.message || 'Error al eliminar shopping',
      {
        status: 500,
        headers: corsBaseHeaders()
      }
    )
  }
}
