// /Users/salvacastro/Desktop/arenaapp/arenaapp-admin/src/lib/auth.ts
import { NextRequest } from 'next/server'
import { JWTPayload, jwtVerify } from 'jose'

const rawSecret = process.env.JWT_SECRET
if (!rawSecret) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno')
}

// jose espera un Uint8Array como secret
const JWT_SECRET = new TextEncoder().encode(rawSecret)

export type JwtPayload = {
  sub: string          // id del usuario en string
  email: string        // opcional en la práctica, pero lo dejamos en el type
  rol: 'ADMIN' | 'USER'
  exp: number
  iat: number
}

// Payload “crudo” que viene del token (lo usamos para castear)
export type AuthPayload = JWTPayload & {
  sub?: string
  email?: string
  rol?: 'ADMIN' | 'USER'
  userId?: number | string    // por compatibilidad con tu login actual
}

/**
 * Verifica el JWT a partir de:
 *  - Authorization: Bearer xxx
 *  - o cookie httpOnly "token"
 */
export async function verifyAuth (req: NextRequest): Promise<JwtPayload> {
  // 1) Intentar Authorization: Bearer xxx
  const authHeader = req.headers.get('authorization')
  let token: string | undefined

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring('Bearer '.length)
  }

  // 2) Si no hay header, intentar cookie "token"
  if (!token) {
    token = req.cookies.get('token')?.value
  }

  if (!token) {
    throw new Error('UNAUTHORIZED_NO_TOKEN')
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: AuthPayload }

    // 👉 compatibilidad: si el token trae userId (como hace tu login actual),
    // lo usamos para construir sub
    const sub =
      payload.sub ??
      (payload.userId != null ? String(payload.userId) : undefined)

    if (!sub) {
      throw new Error('UNAUTHORIZED_INVALID_TOKEN')
    }

    const rol = payload.rol
    if (rol !== 'ADMIN' && rol !== 'USER') {
      throw new Error('UNAUTHORIZED_INVALID_TOKEN')
    }

    if (!payload.exp || !payload.iat) {
      throw new Error('UNAUTHORIZED_INVALID_TOKEN')
    }

    return {
      sub,
      email: payload.email ?? '',
      rol,
      exp: payload.exp,
      iat: payload.iat
    }
  } catch (err) {
    console.error('verifyAuth: error verificando token', err)
    throw new Error('UNAUTHORIZED_INVALID_TOKEN')
  }
}

export function requireAdmin (payload: JwtPayload) {
  if (payload.rol !== 'ADMIN') {
    throw new Error('FORBIDDEN_NOT_ADMIN')
  }
}
