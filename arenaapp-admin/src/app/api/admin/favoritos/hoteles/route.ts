// /src/app/api/admin/favoritos/hoteles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import type { JwtPayload } from '@/lib/auth'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'
const FAVORITO_TIPO_HOTEL = 'HOTEL' as const

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
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  })
}

function getUserIdFromAuth(payload: JwtPayload): number {
  const userId = (payload as any)?.sub
  if (!userId) throw new Error('Token sin sub')
  const parsed = Number(userId)
  if (Number.isNaN(parsed)) throw new Error('sub no numérico')
  return parsed
}

export async function GET(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    if (!payload) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders(),
      })
    }

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()

    const { rows } = await db.query(
      `
      SELECT
        f.id AS favorito_id,
        h.id AS hotel_id,
        h.nombre,
        h.slug,
        h.descripcion_corta,
        h.descripcion_larga,
        h.direccion,
        h.ciudad,
        h.provincia,
        h.pais,
        h.zona,
        h.lat,
        h.lng,
        h.telefono,
        h.email_contacto,
        h.sitio_web,
        h.instagram,
        h.facebook,
        h.estrellas,
        h.checkin_desde,
        h.checkout_hasta,
        h.precio_noche_desde,
        h.rango_precio,
        h.moneda,
        h.es_destacado,
        -- 👇 aseguramos una imagen siempre que haya alguna de las dos
        COALESCE(h.url_imagen, h.imagen_principal) AS url_imagen,
        h.url_maps,
        h.url_reservas,
        h.horario_text,
        h.meta_title,
        h.meta_description,
        h.resena,
        h.estado,
        h.created_at,
        h.updated_at
      FROM favoritos f
      JOIN hoteles h ON h.id = f.item_id
      WHERE f.usuario_id = $1
        AND f.tipo = $2
      ORDER BY f.id DESC
      `,
      [userId, FAVORITO_TIPO_HOTEL]
    )

    return NextResponse.json(rows, {
      status: 200,
      headers: corsBaseHeaders(),
    })
  } catch (err) {
    console.error('GET favoritos/hoteles', err)
    return new NextResponse('Error', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    if (!payload) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders(),
      })
    }

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()
    const body = await req.json()

    const hotelId = Number(body.hotelId ?? body.hotel_id ?? body.id)
    if (!hotelId) {
      return new NextResponse('hotelId inválido', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    await db.query(
      `
      INSERT INTO favoritos (usuario_id, tipo, item_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (usuario_id, tipo, item_id) DO NOTHING
      `,
      [userId, FAVORITO_TIPO_HOTEL, hotelId]
    )

    return new NextResponse(null, {
      status: 204,
      headers: corsBaseHeaders(),
    })
  } catch (err) {
    console.error('POST favoritos/hoteles', err)
    return new NextResponse('Error', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    if (!payload) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders(),
      })
    }

    const userId = getUserIdFromAuth(payload)
    const db = await getDb()
    const body = await req.json()

    const hotelId = Number(body.hotelId ?? body.hotel_id ?? body.id)
    if (!hotelId) {
      return new NextResponse('hotelId inválido', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    await db.query(
      `
      DELETE FROM favoritos
      WHERE usuario_id = $1
        AND tipo = $2
        AND item_id = $3
      `,
      [userId, FAVORITO_TIPO_HOTEL, hotelId]
    )

    return new NextResponse(null, {
      status: 204,
      headers: corsBaseHeaders(),
    })
  } catch (err) {
    console.error('DELETE favoritos/hoteles', err)
    return new NextResponse('Error', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}
