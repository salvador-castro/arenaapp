import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getDb } from '@/lib/db'
import { AuthPayload, verifyAuth } from '@/lib/auth'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'

function corsBaseHeaders () {
  return {
    'Access-Control-Allow-Origin': FRONT_ORIGIN,
    'Access-Control-Allow-Credentials': 'true'
  }
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars')

export function OPTIONS () {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsBaseHeaders(),
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

// POST /api/auth/perfil/avatar
export async function POST (req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    const userId = (payload as AuthPayload).userId

    if (!userId) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders()
      })
    }

    const formData = await req.formData()
    const file = formData.get('avatar')

    if (!(file instanceof File)) {
      return new NextResponse('No se envió archivo', {
        status: 400,
        headers: corsBaseHeaders()
      })
    }

    if (file.size > 2 * 1024 * 1024) {
      return new NextResponse('La imagen no puede superar los 2 MB', {
        status: 400,
        headers: corsBaseHeaders()
      })
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const originalName = file.name || 'avatar.jpg'
    const ext = originalName.includes('.')
      ? originalName.split('.').pop()
      : 'jpg'

    const filename = `avatar_${userId}_${Date.now()}.${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filepath, buffer)

    const relativeUrl = `/uploads/avatars/${filename}`

    const db = getDb()
    await db.query(
      `
      UPDATE usuarios
      SET avatar_url = $1
      WHERE id = $2
      `,
      [relativeUrl, userId]
    )

    return NextResponse.json(
      { avatar_url: relativeUrl },
      { status: 200, headers: corsBaseHeaders() }
    )
  } catch (err: any) {
    console.error('Error POST /api/auth/perfil/avatar:', err)

    if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === 'UNAUTHORIZED_INVALID_TOKEN') {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders()
      })
    }

    return new NextResponse('Error al subir avatar', {
      status: 500,
      headers: corsBaseHeaders()
    })
  }
}
