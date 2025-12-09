import { NextRequest } from 'next/server'
import { JWTPayload, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export type JwtPayload = {
  sub: string
  email: string
  rol: 'ADMIN' | 'USER'
  exp: number
  iat: number
}

export type AuthPayload = JWTPayload & {
  userId?: number | string
  rol?: 'ADMIN' | 'USER'
}

/**
 * Obtiene el userId del payload JWT.
 * Soporta tanto `sub` como `userId`.
 */
export function getUserIdFromPayload (payload: JwtPayload | AuthPayload | any): number {
  const raw = (payload as any)?.userId ?? (payload as any)?.sub
  const userId = Number(raw)

  if (!userId || Number.isNaN(userId)) {
    throw new Error('UNAUTHORIZED_INVALID_USER')
  }

  return userId
}

export async function verifyAuth (req: NextRequest) {
  // 1) Intentar leer Authorization: Bearer xxx
  const authHeader = req.headers.get('authorization')
  let token: string | undefined

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const candidate = authHeader.substring('Bearer '.length).trim()
    // evitamos "undefined", "null" o vacío
    if (candidate && candidate !== 'undefined' && candidate !== 'null') {
      token = candidate
    }
  }

  // 2) Si no hay header válido, intentar cookie "token"
  if (!token) {
    token = req.cookies.get('token')?.value
  }

  if (!token) {
    throw new Error('UNAUTHORIZED_NO_TOKEN')
  }

  const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: JwtPayload }

  return payload
}

export function requireAdmin (payload: JwtPayload | AuthPayload) {
  if (payload.rol !== 'ADMIN') {
    throw new Error('FORBIDDEN_NOT_ADMIN')
  }
}
