// src/app/api/admin/hoteles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { AdminHotel, AdminHotelPayload, HotelDetalle } from '@/types/hotel'
import { autoTranslate } from '@/lib/translateHelper'

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
      'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  })
}

// -------- GET /api/admin/hoteles/[id] ----------
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req)
    requireAdmin(user)

    const { id } = await context.params
    const hotelId = Number(id)

    if (Number.isNaN(hotelId)) {
      return new NextResponse('ID inválido', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    const { data, error } = await supabaseAdmin
      .from('hoteles')
      .select('*, hoteles_detalle(*)')
      .eq('id', hotelId)
      .maybeSingle()

    if (error) {
      console.error('Supabase error GET hotel [id]:', error)
      return new NextResponse(error.message, {
        status: 500,
        headers: corsBaseHeaders(),
      })
    }

    if (!data) {
      return new NextResponse('Hotel no encontrado', {
        status: 404,
        headers: corsBaseHeaders(),
      })
    }

    const detalleArr: HotelDetalle[] = (data as any).hoteles_detalle || []
    const detalle: HotelDetalle | null =
      detalleArr.length > 0 ? detalleArr[0] : null

    const { hoteles_detalle, ...hotelFields } = data as any

    const result: AdminHotel = {
      ...(hotelFields as any),
      detalle,
    }

    return NextResponse.json(result, { headers: corsBaseHeaders() })
  } catch (err: any) {
    console.error('Error en GET /api/admin/hoteles/[id]', err)
    return new NextResponse(err.message || 'Error interno', {
      status: err.status || 500,
      headers: corsBaseHeaders(),
    })
  }
}

// -------- PUT /api/admin/hoteles/[id] ----------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req)
    requireAdmin(user)

    const { id } = await context.params
    const hotelId = Number(id)

    if (Number.isNaN(hotelId)) {
      return new NextResponse('ID inválido', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    const body = (await req.json()) as AdminHotelPayload
    const { hotel, detalle } = body

    if (!hotel?.nombre) {
      return new NextResponse('El nombre es obligatorio', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    // Update hotel
    const updateData: any = {
      nombre: hotel.nombre,
      slug: hotel.slug ?? undefined,
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
      estado: hotel.estado ?? 'PUBLICADO',
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('hoteles')
      .update(updateData)
      .eq('id', hotelId)
      .select('*')
      .single()

    if (updateError) {
      console.error('Supabase error PUT hotel [id]:', updateError)
      return new NextResponse(updateError.message, {
        status: 500,
        headers: corsBaseHeaders(),
      })
    }

    // Upsert detalle
    let newDetalle: HotelDetalle | null = null

    if (detalle) {
      const detalleData: any = {
        ...detalle,
        hotel_id: hotelId,
      }

      const { data: detRows, error: detError } = await supabaseAdmin
        .from('hoteles_detalle')
        .upsert(detalleData, {
          onConflict: 'hotel_id',
        })
        .select('*')
        .single()

      if (detError) {
        console.error('Supabase error PUT hoteles_detalle:', detError)
      } else {
        newDetalle = detRows as HotelDetalle
      }
    } else {
      // si viene sin detalle, opcionalmente podrías borrar el detalle
      // await supabaseAdmin.from('hoteles_detalle').delete().eq('hotel_id', hotelId)
    }

    const result: AdminHotel = {
      ...(updated as any),
      detalle: newDetalle,
    }

    // ✨ Traducir automáticamente en background
    if (updated?.id) {
      autoTranslate('hoteles', updated.id).catch((err) => {
        console.error('[PUT /hoteles/:id] Error auto-traducción:', err)
      })
    }

    return NextResponse.json(result, { headers: corsBaseHeaders() })
  } catch (err: any) {
    console.error('Error en PUT /api/admin/hoteles/[id]', err)
    return new NextResponse(err.message || 'Error interno', {
      status: err.status || 500,
      headers: corsBaseHeaders(),
    })
  }
}

// -------- DELETE /api/admin/hoteles/[id] ----------
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(req)
    requireAdmin(user)

    const { id } = await context.params
    const hotelId = Number(id)

    if (Number.isNaN(hotelId)) {
      return new NextResponse('ID inválido', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    // primero borro detalle por las dudas (aunque tengas ON DELETE CASCADE en la FK)
    await supabaseAdmin.from('hoteles_detalle').delete().eq('hotel_id', hotelId)

    const { error: delError } = await supabaseAdmin
      .from('hoteles')
      .delete()
      .eq('id', hotelId)

    if (delError) {
      console.error('Supabase error DELETE hotel [id]:', delError)
      return new NextResponse(delError.message, {
        status: 500,
        headers: corsBaseHeaders(),
      })
    }

    return new NextResponse(null, {
      status: 204,
      headers: corsBaseHeaders(),
    })
  } catch (err: any) {
    console.error('Error en DELETE /api/admin/hoteles/[id]', err)
    return new NextResponse(err.message || 'Error interno', {
      status: err.status || 500,
      headers: corsBaseHeaders(),
    })
  }
}
