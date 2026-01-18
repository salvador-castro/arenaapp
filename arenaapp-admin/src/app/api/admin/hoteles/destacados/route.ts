// src/app/api/admin/hoteles/destacados/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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

// GET /api/admin/hoteles/destacados  (público, sin admin)
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('hoteles')
      .select(
        `
        id,
        nombre,
        slug,
        descripcion_corta,
        descripcion_larga,
        direccion,
        ciudad,
        provincia,
        pais,
        zona,
        lat,
        lng,
        telefono,
        email_contacto,
        sitio_web,
        instagram,
        facebook,
        estrellas,
        checkin_desde,
        checkout_hasta,
        precio_noche_desde,
        rango_precio,
        moneda,
        es_destacado,
        imagen_principal,
        url_imagen,
        url_maps,
        url_reservas,
        horario_text,
        meta_title,
        meta_description,
        resena,
        estado,
        created_at,
        updated_at
        `
      )
      .eq('es_destacado', true)
      .eq('estado', 'PUBLICADO')
      .order('nombre', { ascending: true })

    if (error) {
      console.error('Supabase error GET /hoteles/destacados:', error)
      return new NextResponse(
        error.message || 'Error al obtener hoteles destacados',
        {
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin')),
        }
      )
    }

    const origin = req.headers.get('origin')
    return new NextResponse(JSON.stringify(data || []), {
      status: 200,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/hoteles/destacados:', err)
    const origin = req.headers.get('origin')

    return new NextResponse(
      err?.message || 'Error al obtener hoteles destacados',
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    )
  }
}
