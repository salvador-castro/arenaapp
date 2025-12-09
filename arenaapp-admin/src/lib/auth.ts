import { NextRequest } from 'next/server'
import { JWTPayload, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

/**
 * Payload base que viene en el JWT
 * sub = id del usuario (string)
 */
export type JwtPayload = {
  sub: string
  email: string
  rol: 'ADMIN' | 'USER'
  exp: number
  iat: number
}

/**
 * Payload extendido que usamos en la app
 */
export type AuthPayload = JWTPayload & {
  userId: number
}

export async function verifyAuth(req: NextRequest): Promise<AuthPayload> {
  const token = req.cookies.get('token')?.value
  if (!token) {
    throw new Error('UNAUTHORIZED_NO_TOKEN')
  }

  const { payload } = await jwtVerify(token, JWT_SECRET)

  const base = payload as JwtPayload

  const authPayload: AuthPayload = {
    ...base,
    userId: Number(base.sub)
  }

  if (!authPayload.userId || Number.isNaN(authPayload.userId)) {
    throw new Error('UNAUTHORIZED_INVALID_USER')
  }

  return authPayload
}

export function requireAdmin(payload: JwtPayload | AuthPayload) {
  if (payload.rol !== 'ADMIN') {
    throw new Error('FORBIDDEN_NOT_ADMIN')
  }
}
