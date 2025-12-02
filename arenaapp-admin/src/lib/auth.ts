import { NextRequest, NextResponse } from 'next/server'
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


export async function verifyAuth(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    throw new Error('UNAUTHORIZED_NO_TOKEN')
  }

  const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: JwtPayload }

  return payload
}

export function requireAdmin(payload: JwtPayload) {
  if (payload.rol !== 'ADMIN') {
    throw new Error('FORBIDDEN_NOT_ADMIN')
  }
}
