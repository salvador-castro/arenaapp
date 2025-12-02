import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verifyAuth, requireAdmin } from '@/lib/auth'
import { getDb } from '@/lib/db'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'

function corsHeaders (extra: Record<string, string> = {}) {
  return {
    'Access-Control-Allow-Origin': FRONT_ORIGIN,
    'Access-Control-Allow-Credentials': 'true',
    ...extra
  }
}

export function OPTIONS () {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders({
      'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
  })
}

// GET /api/admin/users/:id
export async function GET (
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 lo que Next espera
) {
  const { id } = await context.params

  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const db = getDb()

    const { rows } = await db.query(
      `
      SELECT 
        id,
        nombre,
        apellido,
        email,
        telefono,
        ciudad,
        pais,
        rol,
        activo,
        avatar_url,
        last_login_at,
        created_at,
        updated_at
      FROM usuarios
      WHERE id = $1
      `,
      [id]
    )

    const user = rows[0] ?? null

    if (!user) {
      return new NextResponse('Usuario no encontrado', {
        status: 404,
        headers: corsHeaders()
      })
    }

    return new NextResponse(JSON.stringify(user), {
      status: 200,
      headers: corsHeaders({
        'Content-Type': 'application/json'
      })
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/users/[id]:', err)

    if (
      err.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsHeaders()
      })
    }
    if (err.message === 'FORBIDDEN_NOT_ADMIN') {
      return new NextResponse('Prohibido', {
        status: 403,
        headers: corsHeaders()
      })
    }

    return new NextResponse('Error al obtener usuario', {
      status: 500,
      headers: corsHeaders()
    })
  }
}

// PUT /api/admin/users/:id
export async function PUT (
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 igual acá
) {
  const { id } = await context.params

  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const body = await req.json()
    const {
      nombre,
      apellido,
      email,
      password,
      rol,
      activo,
      telefono,
      ciudad,
      pais
    } = body

    if (!nombre || !apellido || !email) {
      return new NextResponse('Faltan campos obligatorios', {
        status: 400,
        headers: corsHeaders()
      })
    }

    const rolFinal = rol === 'ADMIN' ? 'ADMIN' : 'USER'
    const activoFinal = activo ? 1 : 0

    const db = getDb()

    // Si viene password nueva → también actualizamos password_hash
    if (password && password.trim().length > 0) {
      const passwordHash = await bcrypt.hash(password, 10)

      const result = await db.query(
        `
        UPDATE usuarios
        SET 
          nombre = $1,
          apellido = $2,
          email = $3,
          telefono = $4,
          ciudad = $5,
          pais = $6,
          rol = $7,
          activo = $8,
          password_hash = $9
        WHERE id = $10
        `,
        [
          nombre,
          apellido,
          email,
          telefono ?? null,
          ciudad ?? null,
          pais ?? null,
          rolFinal,
          activoFinal,
          passwordHash,
          id
        ]
      )

      if (result.rowCount === 0) {
        return new NextResponse('Usuario no encontrado', {
          status: 404,
          headers: corsHeaders()
        })
      }
    } else {
      // Sin cambio de password
      const result = await db.query(
        `
        UPDATE usuarios
        SET 
          nombre = $1,
          apellido = $2,
          email = $3,
          telefono = $4,
          ciudad = $5,
          pais = $6,
          rol = $7,
          activo = $8
        WHERE id = $9
        `,
        [
          nombre,
          apellido,
          email,
          telefono ?? null,
          ciudad ?? null,
          pais ?? null,
          rolFinal,
          activoFinal,
          id
        ]
      )

      if (result.rowCount === 0) {
        return new NextResponse('Usuario no encontrado', {
          status: 404,
          headers: corsHeaders()
        })
      }
    }

    const { rows } = await db.query(
      `
      SELECT 
        id,
        nombre,
        apellido,
        email,
        telefono,
        ciudad,
        pais,
        rol,
        activo,
        avatar_url,
        last_login_at,
        created_at,
        updated_at
      FROM usuarios
      WHERE id = $1
      `,
      [id]
    )

    const user = rows[0] ?? null

    return new NextResponse(JSON.stringify(user), {
      status: 200,
      headers: corsHeaders({
        'Content-Type': 'application/json'
      })
    })
  } catch (err: any) {
    console.error('Error PUT /api/admin/users/[id]:', err)

    // clave duplicada en Postgres
    if (err.code === '23505') {
      return new NextResponse('El email ya está registrado', {
        status: 409,
        headers: corsHeaders()
      })
    }

    if (
      err.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsHeaders()
      })
    }
    if (err.message === 'FORBIDDEN_NOT_ADMIN') {
      return new NextResponse('Prohibido', {
        status: 403,
        headers: corsHeaders()
      })
    }

    return new NextResponse('Error al actualizar usuario', {
      status: 500,
      headers: corsHeaders()
    })
  }
}

// DELETE /api/admin/users/:id
export async function DELETE (
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 y acá también
) {
  const { id } = await context.params

  try {
    const payload = await verifyAuth(req)
    requireAdmin(payload)

    const db = getDb()

    const result = await db.query(
      'DELETE FROM usuarios WHERE id = $1',
      [id]
    )

    if (result.rowCount === 0) {
      return new NextResponse('Usuario no encontrado', {
        status: 404,
        headers: corsHeaders()
      })
    }

    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders()
    })
  } catch (err: any) {
    console.error('Error DELETE /api/admin/users/[id]:', err)

    if (
      err.message === 'UNAUTHORIZED_NO_TOKEN' ||
      err.message === 'UNAUTHORIZED_INVALID_TOKEN'
    ) {
      return new NextResponse('No autorizado', {
        status: 401,
        headers: corsHeaders()
      })
    }
    if (err.message === 'FORBIDDEN_NOT_ADMIN') {
      return new NextResponse('Prohibido', {
        status: 403,
        headers: corsHeaders()
      })
    }

    return new NextResponse('Error al eliminar usuario', {
      status: 500,
      headers: corsHeaders()
    })
  }
}
