// C:\Users\salvaCastro\Desktop\arenaapp-admin\src\app\api\admin\eventos\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth, requireAdmin } from '@/lib/auth'

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

// GET /api/admin/eventos/:id
export async function GET(req: NextRequest, context: ContextWithId) {
  try {
    await verifyAuth(req) // cualquier user logueado

    const { id } = await context.params
    const db = await getDb()

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
      WHERE id = $1
      `,
      [id]
    )

    const evento = result.rows[0]

    if (!evento) {
      return new NextResponse('Evento no encontrado', {
        status: 404,
        headers: corsBaseHeaders(),
      })
    }

    return new NextResponse(JSON.stringify(evento), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/eventos/[id]:', err)

    if (
      err.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders(),
      })
    }

    return new NextResponse(err?.message || 'Error al obtener evento', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}

// PUT /api/admin/eventos/:id
export async function PUT(req: NextRequest, context: ContextWithId) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const { id } = await context.params
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

    if (!titulo || !categoria || !direccion || !fecha_inicio) {
      return new NextResponse('Faltan campos obligatorios', {
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

    const db = await getDb()

    await db.query(
      `
      UPDATE eventos
      SET
        titulo          = $1,
        categoria       = $2,
        es_destacado    = $3,
        fecha_inicio    = $4,
        fecha_fin       = $5,
        es_todo_el_dia  = $6,
        zona            = $7,
        direccion       = $8,
        es_gratuito     = $9,
        precio_desde    = $10,
        moneda          = $11,
        url_entradas    = $12,
        estado          = $13,
        resena          = $14,
        imagen_principal = $15,
        updated_at      = NOW()
      WHERE id = $16
      `,
      [
        titulo,
        categoria,
        esDestacadoValue,
        fecha_inicio,
        fecha_fin || null,
        esTodoElDiaValue,
        zonaValue,
        direccion,
        es_gratuito,
        precioDesdeValue,
        monedaValue,
        url_entradas,
        estadoValue,
        resena || null,
        imagen_principal || null,
        id,
      ]
    )

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
      WHERE id = $1
      `,
      [id]
    )

    const evento = result.rows[0]

    return new NextResponse(JSON.stringify(evento), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error PUT /api/admin/eventos/[id]:', err)

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

    return new NextResponse(err?.message || 'Error al actualizar evento', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}

// DELETE /api/admin/eventos/:id
export async function DELETE(req: NextRequest, context: ContextWithId) {
  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const { id } = await context.params
    const db = await getDb()

    await db.query('DELETE FROM eventos WHERE id = $1', [id])

    return new NextResponse(null, {
      status: 204,
      headers: corsBaseHeaders(),
    })
  } catch (err: any) {
    console.error('Error DELETE /api/admin/eventos/[id]:', err)

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

    return new NextResponse(err?.message || 'Error al eliminar evento', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}
