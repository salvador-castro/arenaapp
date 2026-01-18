// C:\Users\salvaCastro\Desktop\arenaapp-admin\src\app\api\admin\eventos\destacados\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

import { getCorsHeaders } from '@/lib/cors'

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(origin),
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// GET /api/admin/eventos/destacados  (público)
export async function GET(req: NextRequest) {
  try {
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
        estrellas
      FROM eventos
      WHERE
        es_destacado = TRUE
        AND estado = 'PUBLICADO'
        AND visibilidad = 'PUBLICO'
      ORDER BY fecha_inicio ASC, id ASC
      `
    )

    const origin = req.headers.get('origin')
    return new NextResponse(JSON.stringify(result.rows), {
      status: 200,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/eventos/destacados:', err)
    const origin = req.headers.get('origin')

    return new NextResponse(
      err?.message || 'Error al obtener eventos destacados',
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    )
  }
}
