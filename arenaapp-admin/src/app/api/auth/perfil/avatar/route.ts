// /src/app/api/auth/perfil/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { AuthPayload, verifyAuth } from '@/lib/auth'
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
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Helper para obtener el userId del payload JWT
function getUserIdFromPayload(payload: AuthPayload | any): number {
  // intentamos en este orden: userId, sub, id
  const raw =
    (payload as any)?.userId ?? (payload as any)?.sub ?? (payload as any)?.id

  if (!raw) {
    throw new Error('UNAUTHORIZED_INVALID_TOKEN')
  }

  const num =
    typeof raw === 'string'
      ? Number.parseInt(raw, 10)
      : typeof raw === 'number'
        ? raw
        : NaN

  if (!num || Number.isNaN(num)) {
    throw new Error('UNAUTHORIZED_INVALID_TOKEN')
  }

  return num
}

// POST /api/auth/perfil/avatar
export async function POST(req: NextRequest) {
  try {
    // 1) Verificar usuario autenticado
    const payload = await verifyAuth(req)
    const userId = getUserIdFromPayload(payload)

    // 2) Leer el archivo del form-data
    const formData = await req.formData()
    const file = formData.get('avatar')

    if (!(file instanceof File)) {
      return new NextResponse('No se envió archivo', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    // 3) Validar tamaño (máx 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      return new NextResponse('La imagen no puede superar los 2 MB', {
        status: 400,
        headers: corsBaseHeaders(),
      })
    }

    // 4) Preparar nombre y ruta en el bucket "avatars"
    const originalName = file.name || 'avatar.jpg'
    const ext = originalName.includes('.')
      ? originalName.split('.').pop()
      : 'jpg'

    // bucket: avatars
    // path:   user-<id>/avatar.<ext>
    const storagePath = `user-${userId}/avatar.${ext}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 5) Subir a Supabase Storage (bucket "avatars")
    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true, // sobreescribe el avatar anterior del usuario
      })

    if (uploadError) {
      console.error('Error subiendo avatar a Supabase Storage:', uploadError)
      return new NextResponse('Error al subir avatar', {
        status: 500,
        headers: corsBaseHeaders(),
      })
    }

    // 6) Obtener URL pública
    const { data: publicData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(storagePath)

    const publicUrl = publicData.publicUrl

    // 7) Guardar en la tabla usuarios
    const db = await getDb()
    await db.query(
      `
      UPDATE usuarios
      SET avatar_url = $1,
          updated_at = now()
      WHERE id = $2
      `,
      [publicUrl, userId]
    )

    // 8) Responder al front con la nueva URL
    return NextResponse.json(
      { avatar_url: publicUrl },
      { status: 200, headers: corsBaseHeaders() }
    )
  } catch (err: any) {
    console.error('Error POST /api/auth/perfil/avatar:', err)

    if (
      err?.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err?.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders(),
      })
    }

    return new NextResponse('Error al subir avatar', {
      status: 500,
      headers: corsBaseHeaders(),
    })
  }
}
