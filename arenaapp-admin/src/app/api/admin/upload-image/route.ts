import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'https://arenapress.app'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Faltan variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para upload-image'
  )
}

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null

function corsHeaders () {
  return {
    'Access-Control-Allow-Origin': FRONT_ORIGIN,
    'Access-Control-Allow-Credentials': 'true'
  }
}

export function OPTIONS () {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

export async function POST (req: NextRequest) {
  try {
    if (!supabase) {
      return new NextResponse('Supabase no configurado en el servidor', {
        status: 500,
        headers: corsHeaders()
      })
    }

    const formData = await req.formData()

    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string | null) ?? 'generico'

    if (!file) {
      return new NextResponse('No se envió archivo', {
        status: 400,
        headers: corsHeaders()
      })
    }

    // Leer el contenido del archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Mantener nombre original, pero limpiar espacios y acentos
    const cleanName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // saca tildes
      .replace(/\s+/g, '-') // espacios por guiones

    const filename = cleanName // sin timestamp

    // Ruta dentro del bucket: restaurantes/la-huella.jpg
    const storagePath = `${folder}/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('uploads') // nombre del bucket
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false // si ya existe, falla (evita overwrite silencioso)
      })

    if (uploadError) {
      console.error('Error subiendo a Supabase Storage:', uploadError)
      return new NextResponse('Error al subir imagen', {
        status: 500,
        headers: corsHeaders()
      })
    }

    const { data: publicData } = supabase.storage
      .from('uploads')
      .getPublicUrl(storagePath)

    const publicUrl = publicData.publicUrl

    return new NextResponse(
      JSON.stringify({
        path: publicUrl, // URL pública completa
        storagePath // ej: restaurantes/la-huella.jpg
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (err) {
    console.error('Error en upload-image:', err)
    return new NextResponse('Error al subir imagen', {
      status: 500,
      headers: corsHeaders()
    })
  }
}
