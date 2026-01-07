import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import type { JwtPayload } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'
const FAVORITO_TIPO_CAFE = 'CAFE' as const

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

// Helper → saca el userId del payload
function getUserIdFromAuth(payload: JwtPayload): number {
    const userId = (payload as any)?.sub
    if (!userId) {
        throw new Error('Token sin sub (userId)')
    }
    const parsed = Number(userId)
    if (Number.isNaN(parsed)) {
        throw new Error('sub del token no es numérico')
    }
    return parsed
}

// Helper logging
function logDebug(message: string, data?: any) {
    try {
        const logPath = path.join(process.cwd(), 'debug_favoritos_cafes.log')
        const timestamp = new Date().toISOString()
        const line = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`
        fs.appendFileSync(logPath, line)
    } catch (e) {
        console.error('Error writing to log file', e)
    }
}

// GET → lista favoritos de CAFES para el usuario logueado
export async function GET(req: NextRequest) {
    try {
        const payload = await verifyAuth(req)
        if (!payload) {
            logDebug('GET Unauthorized: No payload')
            return new NextResponse('No autorizado', {
                status: 401,
                headers: corsBaseHeaders(),
            })
        }

        const userId = getUserIdFromAuth(payload)
        logDebug(`GET Request for userId: ${userId} requesting type ${FAVORITO_TIPO_CAFE}`)
        const db = await getDb()

        const { rows } = await db.query(
            `
      SELECT
        f.id AS favorito_id,
        c.id AS cafe_id,
        c.*
      FROM favoritos f
      JOIN cafes c ON c.id = f.item_id
      WHERE f.usuario_id = $1
        AND f.tipo = $2
      ORDER BY f.id DESC
      `,
            [userId, FAVORITO_TIPO_CAFE]
        )

        logDebug(`GET Success: Found ${rows.length} rows`)

        return NextResponse.json(rows, {
            status: 200,
            headers: corsBaseHeaders(),
        })
    } catch (err: any) {
        logDebug('GET Error', { message: err.message, stack: err.stack })
        console.error('Error GET /favoritos/cafes', err)
        return new NextResponse('Error interno', {
            status: 500,
            headers: corsBaseHeaders(),
        })
    }
}

// POST → marca un cafe como favorito
export async function POST(req: NextRequest) {
    try {
        const payload = await verifyAuth(req)
        if (!payload) {
            logDebug('POST Unauthorized: No payload')
            return new NextResponse('No autorizado', {
                status: 401,
                headers: corsBaseHeaders(),
            })
        }

        const userId = getUserIdFromAuth(payload)
        const db = await getDb()
        const body = await req.json()

        logDebug(`POST Request for userId: ${userId}`, body)

        const cafeId = Number(body.cafeId ?? body.cafe_id ?? body.id)
        if (!cafeId || Number.isNaN(cafeId)) {
            logDebug('POST Invalid cafeId', { body })
            return new NextResponse('cafeId inválido', {
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
            [userId, FAVORITO_TIPO_CAFE, cafeId]
        )

        logDebug('POST Success')

        return NextResponse.json({ success: true }, {
            status: 200,
            headers: corsBaseHeaders(),
        })
    } catch (err: any) {
        logDebug('POST Error', { message: err.message, stack: err.stack })
        console.error('Error POST /favoritos/cafes', err)
        return new NextResponse(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: corsBaseHeaders(),
        })
    }
}

// DELETE → quita un cafe de favoritos
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

        const cafeId = Number(body.cafeId ?? body.cafe_id ?? body.id)
        if (!cafeId || Number.isNaN(cafeId)) {
            return new NextResponse('cafeId inválido', {
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
            [userId, FAVORITO_TIPO_CAFE, cafeId]
        )

        return new NextResponse(null, {
            status: 204,
            headers: corsBaseHeaders(),
        })
    } catch (err: any) {
        console.error('Error DELETE /favoritos/cafes', err)
        return new NextResponse('Error interno', {
            status: 500,
            headers: corsBaseHeaders(),
        })
    }
}
