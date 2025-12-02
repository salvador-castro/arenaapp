import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { AuthPayload, verifyAuth } from '@/lib/auth'

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
      'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

// GET /api/auth/perfil -> datos del usuario autenticado
export async function GET (req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    const userId = (payload as AuthPayload).userId

    if (!userId) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders()
      })
    }

    const db = getDb()
    const result = await db.query(
      `
      SELECT
        id,
        nombre,
        apellido,
        email,
        telefono,
        ciudad,
        pais,
        bio,
        avatar_url,
        rol,
        activo,
        last_login_at,
        created_at,
        updated_at
      FROM usuarios
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    )

    const user = result.rows[0]

    if (!user) {
      return new NextResponse('Usuario no encontrado', {
        status: 404,
        headers: corsBaseHeaders()
      })
    }

    return NextResponse.json(user, {
      status: 200,
      headers: corsBaseHeaders()
    })
  } catch (err: any) {
    console.error('Error GET /api/auth/perfil:', err)

    if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === 'UNAUTHORIZED_INVALID_TOKEN') {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders()
      })
    }

    return new NextResponse('Error al obtener perfil', {
      status: 500,
      headers: corsBaseHeaders()
    })
  }
}

// PUT /api/auth/perfil -> actualizar datos + (opcional) contraseña
export async function PUT (req: NextRequest) {
  try {
    const payload = await verifyAuth(req)
    const userId = (payload as AuthPayload).userId

    if (!userId) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders()
      })
    }

    const body = await req.json()
    const {
      nombre,
      apellido,
      email,
      telefono,
      ciudad,
      pais,
      bio,
      avatar_url,
      passwordActual,
      passwordNueva
    } = body

    if (!nombre || !apellido || !email) {
      return new NextResponse('Nombre, apellido y email son obligatorios', {
        status: 400,
        headers: corsBaseHeaders()
      })
    }

    const db = getDb()

    // Si quiere cambiar contraseña, validamos la actual y seteamos la nueva
    if (passwordActual || passwordNueva) {
      if (!passwordActual || !passwordNueva) {
        return new NextResponse(
          'Para cambiar la contraseña completá contraseña actual y nueva',
          {
            status: 400,
            headers: corsBaseHeaders()
          }
        )
      }

      const pwResult = await db.query(
        'SELECT password_hash FROM usuarios WHERE id = $1 LIMIT 1',
        [userId]
      )

      const row = pwResult.rows[0]
      if (!row) {
        return new NextResponse('Usuario no encontrado', {
          status: 404,
          headers: corsBaseHeaders()
        })
      }

      const ok = await bcrypt.compare(passwordActual, row.password_hash)
      if (!ok) {
        return new NextResponse('La contraseña actual es incorrecta', {
          status: 400,
          headers: corsBaseHeaders()
        })
      }

      const newHash = await bcrypt.hash(passwordNueva, 10)
      await db.query(
        `
        UPDATE usuarios
        SET password_hash = $1
        WHERE id = $2
        `,
        [newHash, userId]
      )
    }

    // Actualizar datos básicos
    await db.query(
      `
      UPDATE usuarios
      SET
        nombre = $1,
        apellido = $2,
        email = $3,
        telefono = $4,
        ciudad = $5,
        pais = $6,
        bio = $7,
        avatar_url = $8
      WHERE id = $9
      `,
      [
        nombre,
        apellido,
        email,
        telefono || null,
        ciudad || null,
        pais || null,
        bio || null,
        avatar_url || null,
        userId
      ]
    )

    const updated = await db.query(
      `
      SELECT
        id,
        nombre,
        apellido,
        email,
        telefono,
        ciudad,
        pais,
        bio,
        avatar_url,
        rol,
        activo,
        last_login_at,
        created_at,
        updated_at
      FROM usuarios
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    )

    const user = updated.rows[0]

    return NextResponse.json(user, {
      status: 200,
      headers: corsBaseHeaders()
    })
  } catch (err: any) {
    console.error('Error PUT /api/auth/perfil:', err)

    if (err.message === 'UNAUTHORIZED_NO_TOKEN' || err.message === 'UNAUTHORIZED_INVALID_TOKEN') {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsBaseHeaders()
      })
    }

    return new NextResponse('Error al actualizar perfil', {
      status: 500,
      headers: corsBaseHeaders()
    })
  }
}
