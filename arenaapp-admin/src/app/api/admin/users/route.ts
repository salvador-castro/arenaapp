// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\api\admin\users\route.ts

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
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
  })
}

// GET /api/admin/users -> lista de usuarios (solo ADMIN)
export async function GET (req: NextRequest) {
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
      ORDER BY id ASC
      `
    )

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: corsHeaders({
        'Content-Type': 'application/json'
      })
    })
  } catch (err: any) {
    console.error('Error GET /api/admin/users:', err)

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

    return new NextResponse('Error al obtener usuarios', {
      status: 500,
      headers: corsHeaders()
    })
  }
}

// POST /api/admin/users -> crear usuario (solo ADMIN)
export async function POST (req: NextRequest) {
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

    if (!nombre || !apellido || !email || !password) {
      return new NextResponse('Faltan campos obligatorios', {
        status: 400,
        headers: corsHeaders()
      })
    }

    const rolFinal = rol === 'ADMIN' ? 'ADMIN' : 'USER'
    const activoFinal = activo ? 1 : 0

    const passwordHash = await bcrypt.hash(password, 10)
    const db = getDb()

    // INSERT + RETURNING en Postgres
    const { rows } = await db.query(
      `
      INSERT INTO usuarios 
        (nombre, apellido, email, telefono, ciudad, pais, password_hash, rol, activo)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
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
      `,
      [
        nombre,
        apellido,
        email,
        telefono ?? null,
        ciudad ?? null,
        pais ?? null,
        passwordHash,
        rolFinal,
        activoFinal
      ]
    )

    const user = rows[0] ?? null

    return new NextResponse(JSON.stringify(user), {
      status: 201,
      headers: corsHeaders({
        'Content-Type': 'application/json'
      })
    })
  } catch (err: any) {
    console.error('Error POST /api/admin/users:', err)

    // Código de duplicado en Postgres suele ser 23505
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

    return new NextResponse('Error al crear usuario', {
      status: 500,
      headers: corsHeaders()
    })
  }
}
