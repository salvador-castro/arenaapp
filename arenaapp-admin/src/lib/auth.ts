import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const rawSecret = process.env.JWT_SECRET
if (!rawSecret) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno')
}
const JWT_SECRET = new TextEncoder().encode(rawSecret)

export type JwtPayload = {
  userId: number
  rol: 'ADMIN' | 'USER'
  exp: number
  iat: number
}

export async function verifyAuth (req: NextRequest): Promise<JwtPayload> {
  // 1) Intentar leer Authorization: Bearer xxx
  const authHeader = req.headers.get('authorization')
  let token: string | undefined

  if (authHeader && authHeader.startsWith('Bearer ')) {
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
    const { payload } = await jwtVerify(token, JWT_SECRET)

    const userId = Number((payload as any).userId)
    const rol = (payload as any).rol as 'ADMIN' | 'USER'
    const exp = (payload as any).exp as number
    const iat = (payload as any).iat as number

    if (!userId || Number.isNaN(userId)) {
      throw new Error('UNAUTHORIZED_INVALID_USER')
    }

    if (rol !== 'ADMIN' && rol !== 'USER') {
      throw new Error('UNAUTHORIZED_INVALID_ROLE')
    }

    return { userId, rol, exp, iat }
  } catch (err) {
    console.error('verifyAuth error:', err)
    throw new Error('UNAUTHORIZED_INVALID_TOKEN')
  }
}

export function requireAdmin (payload: JwtPayload) {
  if (payload.rol !== 'ADMIN') {
    throw new Error('FORBIDDEN_NOT_ADMIN')
  }
}
