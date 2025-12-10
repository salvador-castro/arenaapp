// src/app/api/admin/hoteles/public/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'

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
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// GET /api/admin/hoteles/public  (público, solo PUBLICADO)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = (searchParams.get('search') || '').trim()

    let query = supabaseAdmin
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
      .eq('estado', 'PUBLICADO')
      .order('es_destacado', { ascending: false })
      .order('nombre', { ascending: true })

    if (search) {
      const like = `%${search}%`
      query = query.or(
        `nombre.ilike.${like},ciudad.ilike.${like},provincia.ilike.${like},zona.ilike.${like}`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error GET /hoteles/public:', error)
      return new NextResponse(
        error.message || 'Error al obtener hoteles públicos',
        {
          status: 500,
          headers: corsBaseHeaders(),
        }
      )
    }

    return new NextResponse(JSON.stringify(data || []), {
      status: 200,
      headers: {
        ...corsBaseHeaders(),
        'Content-Type': 'application/json',
      },
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/hoteles/public:', err)

    return new NextResponse(
      err?.message || 'Error al obtener hoteles públicos',
      {
        status: 500,
        headers: corsBaseHeaders(),
      }
    )
  }
}
