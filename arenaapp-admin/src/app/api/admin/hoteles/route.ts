// src/app/api/admin/hoteles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { AdminHotel, AdminHotelPayload, HotelDetalle } from '@/types/hotel'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'

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
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    }
  })
}

// util simple para slug
function slugify (str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---- GET /api/admin/hoteles  (lista + paginación + búsqueda) ----
export async function GET (req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    requireAdmin(user)

    const url = new URL(req.url)
    const search = (url.searchParams.get('search') || '').trim()
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
    const pageSize = Math.max(
      1,
      Math.min(50, Number(url.searchParams.get('pageSize') || '10'))
    )

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabaseAdmin
      .from('hoteles')
      // traigo hotel + tabla detalle
      .select('*, hoteles_detalle(*)', { count: 'exact' })
      .order('id', { ascending: true })

    if (search) {
      const like = `%${search}%`
      query = query.or(
        `nombre.ilike.${like},ciudad.ilike.${like},provincia.ilike.${like},zona.ilike.${like}`
      )
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Supabase error GET hoteles:', error)
      return new NextResponse(error.message, {
        status: 500,
        headers: corsBaseHeaders()
      })
    }

    const total = count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    const mapped: AdminHotel[] =
      (data || []).map((row: any) => {
        const detalleArr: HotelDetalle[] = row.hoteles_detalle || []
        const detalle: HotelDetalle | null =
          detalleArr.length > 0 ? detalleArr[0] : null

        const { hoteles_detalle, ...hotelFields } = row

        return {
          ...(hotelFields as any),
          detalle
        } as AdminHotel
      }) ?? []

    return NextResponse.json(
      {
        data: mapped,
        page,
        pageSize,
        total,
        totalPages
      },
      { headers: corsBaseHeaders() }
    )
  } catch (err: any) {
    console.error('Error en GET /api/admin/hoteles', err)
    return new NextResponse(err.message || 'Error interno', {
      status: err.status || 500,
      headers: corsBaseHeaders()
    })
  }
}

// ---- POST /api/admin/hoteles  (crear) ----
export async function POST (req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    requireAdmin(user)

    const body = (await req.json()) as AdminHotelPayload
    const { hotel, detalle } = body

    if (!hotel?.nombre) {
      return new NextResponse('El nombre es obligatorio', {
        status: 400,
        headers: corsBaseHeaders()
      })
    }

    const slug = hotel.slug || slugify(hotel.nombre)

    const insertHotelData: any = {
      nombre: hotel.nombre,
      slug,
      descripcion_corta: hotel.descripcion_corta ?? null,
      descripcion_larga: hotel.descripcion_larga ?? null,
      direccion: hotel.direccion ?? null,
      ciudad: hotel.ciudad ?? null,
      provincia: hotel.provincia ?? null,
      zona: (hotel as any).zona ?? null,
      pais: hotel.pais ?? 'Argentina',
      lat: hotel.lat ?? null,
      lng: hotel.lng ?? null,
      telefono: hotel.telefono ?? null,
      email_contacto: hotel.email_contacto ?? null,
      sitio_web: hotel.sitio_web ?? null,
      instagram: hotel.instagram ?? null,
      facebook: hotel.facebook ?? null,
      estrellas: hotel.estrellas ?? null,
      checkin_desde: hotel.checkin_desde ?? null,
      checkout_hasta: hotel.checkout_hasta ?? null,
      precio_noche_desde: hotel.precio_noche_desde ?? null,
      rango_precio: (hotel as any).rango_precio ?? null,
      moneda: hotel.moneda ?? 'ARS',
      es_destacado: hotel.es_destacado ?? false,
      imagen_principal: hotel.imagen_principal ?? null,
      url_imagen: (hotel as any).url_imagen ?? null,
      url_maps: (hotel as any).url_maps ?? null,
      url_reservas: (hotel as any).url_reservas ?? null,
      horario_text: (hotel as any).horario_text ?? null,
      meta_title: hotel.meta_title ?? null,
      meta_description: hotel.meta_description ?? null,
      resena: (hotel as any).resena ?? null,
      estado: hotel.estado ?? 'PUBLICADO'
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('hoteles')
      .insert(insertHotelData)
      .select('*')
      .single()

    if (insertError) {
      console.error('Supabase error POST hoteles:', insertError)
      return new NextResponse(insertError.message, {
        status: 500,
        headers: corsBaseHeaders()
      })
    }

    let detalleInsertado: HotelDetalle | null = null

    if (detalle) {
      const detalleData: any = {
        ...detalle,
        hotel_id: inserted.id
      }

      const { data: det, error: detError } = await supabaseAdmin
        .from('hoteles_detalle')
        .insert(detalleData)
        .select('*')
        .single()

      if (detError) {
        console.error('Supabase error POST hoteles_detalle:', detError)
        // NO hago rollback, solo aviso
      } else {
        detalleInsertado = det as HotelDetalle
      }
    }

    const result: AdminHotel = {
      ...(inserted as any),
      detalle: detalleInsertado
    }

    return NextResponse.json(result, {
      status: 201,
      headers: corsBaseHeaders()
    })
  } catch (err: any) {
    console.error('Error en POST /api/admin/hoteles', err)
    return new NextResponse(err.message || 'Error interno', {
      status: err.status || 500,
      headers: corsBaseHeaders()
    })
  }
}
