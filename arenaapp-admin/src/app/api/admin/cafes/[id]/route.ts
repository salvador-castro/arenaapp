// /Users/salvacastro/Desktop/arenaapp/arenaapp-admin/src/app/api/admin/cafes/[id]/route.ts
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

// GET /api/admin/cafes/:id
export async function GET(req: NextRequest, context: ContextWithId) {
    try {
        const payload = await verifyAuth(req)
        requireAdmin(payload)

        const { id } = await context.params
        const db = await getDb()

        const result = await db.query(
            `
      SELECT
        id,
        slug,
        nombre,
        tipo_comida,
        rango_precios,
        estrellas,
        zona,
        direccion,
        ciudad,
        provincia,
        pais,
        url_maps,
        horario_text,
        url_reserva,
        instagram,
        sitio_web,
        url_imagen,
        es_destacado,
        estado,
        resena,
        created_at,
        updated_at
      FROM cafes
      WHERE id = $1
      `,
            [id]
        )

        const bar = result.rows[0]

        if (!bar) {
            return new NextResponse('Bar no encontrado', {
                status: 404,
                headers: corsBaseHeaders(),
            })
        }

        return new NextResponse(JSON.stringify(bar), {
            status: 200,
            headers: {
                ...corsBaseHeaders(),
                'Content-Type': 'application/json',
            },
        })
    } catch (err: any) {
        console.error('Error GET /api/admin/cafes/[id]:', err)

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

        return new NextResponse(err?.message || 'Error al obtener bar', {
            status: 500,
            headers: corsBaseHeaders(),
        })
    }
}

// PUT /api/admin/cafes/:id
export async function PUT(req: NextRequest, context: ContextWithId) {
    try {
        const payload = await verifyAuth(req)
        requireAdmin(payload)

        const { id } = await context.params
        const body = await req.json()

        const {
            nombre,
            tipo_comida,
            rango_precios,
            estrellas,
            zona,
            direccion,
            ciudad,
            provincia,
            pais,
            url_maps,
            horario_text,
            url_reserva,
            instagram,
            sitio_web,
            url_imagen,
            es_destacado,
            estado,
            resena,
        } = body

        if (
            !nombre ||
            !tipo_comida ||
            rango_precios == null ||
            estrellas == null ||
            !zona ||
            !direccion ||
            !url_maps ||
            !horario_text ||
            !instagram ||
            !resena ||
            !url_imagen
        ) {
            return new NextResponse('Faltan campos obligatorios', {
                status: 400,
                headers: corsBaseHeaders(),
            })
        }

        const db = await getDb()

        await db.query(
            `
      UPDATE cafes
      SET
        nombre = $1,
        tipo_comida = $2,
        rango_precios = $3,
        estrellas = $4,
        zona = $5,
        direccion = $6,
        ciudad = $7,
        provincia = $8,
        pais = $9,
        url_maps = $10,
        horario_text = $11,
        url_reserva = $12,
        instagram = $13,
        sitio_web = $14,
        url_imagen = $15,
        es_destacado = $16,
        estado = $17,
        resena = $18,
        updated_at = NOW()
      WHERE id = $19
      `,
            [
                nombre,
                tipo_comida,
                rango_precios,
                estrellas,
                zona,
                direccion,
                ciudad || null,
                provincia || null,
                pais || 'Uruguay',
                url_maps,
                horario_text,
                url_reserva || null,
                instagram,
                sitio_web || null,
                url_imagen,
                !!es_destacado,
                estado || 'PUBLICADO',
                resena,
                id,
            ]
        )

        const result = await db.query(
            `
      SELECT
        id,
        slug,
        nombre,
        tipo_comida,
        rango_precios,
        estrellas,
        zona,
        direccion,
        ciudad,
        provincia,
        pais,
        url_maps,
        horario_text,
        url_reserva,
        instagram,
        sitio_web,
        url_imagen,
        es_destacado,
        estado,
        resena,
        created_at,
        updated_at
      FROM cafes
      WHERE id = $1
      `,
            [id]
        )

        const bar = result.rows[0]

        // ✨ Traducir automáticamente en background
        if (bar?.id) {
            autoTranslate('cafes', Number(bar.id)).catch(err => {
                console.error('[PUT /cafes/:id] Error auto-traducción:', err)
            })
        }

        return new NextResponse(JSON.stringify(bar), {
            status: 200,
            headers: {
                ...corsBaseHeaders(),
                'Content-Type': 'application/json',
            },
        })
    } catch (err: any) {
        console.error('Error PUT /api/admin/cafes/[id]:', err)

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

        return new NextResponse(err?.message || 'Error al actualizar bar', {
            status: 500,
            headers: corsBaseHeaders(),
        })
    }
}

// DELETE /api/admin/cafes/:id
export async function DELETE(req: NextRequest, context: ContextWithId) {
    try {
        const payload = await verifyAuth(req)
        requireAdmin(payload)

        const { id } = await context.params
        const db = await getDb()

        await db.query('DELETE FROM cafes WHERE id = $1', [id])

        return new NextResponse(null, {
            status: 204,
            headers: corsBaseHeaders(),
        })
    } catch (err: any) {
        console.error('Error DELETE /api/admin/cafes/[id]:', err)

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

        return new NextResponse(err?.message || 'Error al eliminar bar', {
            status: 500,
            headers: corsBaseHeaders(),
        })
    }
}
