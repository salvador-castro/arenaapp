// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\api\auth\login\route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { DateTime } from 'luxon'
import { getDb } from '@/lib/db'

const rawSecret = process.env.JWT_SECRET
if (!rawSecret) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno')
}
const JWT_SECRET = rawSecret
const SESSION_MINUTES = parseInt(process.env.SESSION_MINUTES ?? '60', 10)
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'

const IS_PROD = process.env.NODE_ENV === 'production'
const COOKIE_DOMAIN = IS_PROD ? '.arenapress.app' : undefined

function corsBaseHeaders() {
  return {
    'Access-Control-Allow-Origin': FRONT_ORIGIN,
    'Access-Control-Allow-Credentials': 'true'
  }
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsBaseHeaders(),
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

export async function POST(req: NextRequest) {
  console.log('ADMIN: entró al endpoint /api/auth/login')

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400, headers: corsBaseHeaders() }
      )
    }

    const db = await getDb()
    const result = await db.query(
      `
      SELECT id, nombre, apellido, email, password_hash, rol
      FROM usuarios
      WHERE email = $1
      LIMIT 1
      `,
      [email]
    )

    const user = result.rows[0]

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401, headers: corsBaseHeaders() }
      )
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401, headers: corsBaseHeaders() }
      )
    }

    const nowBA = DateTime.now().setZone('America/Argentina/Buenos_Aires')
    const iat = Math.floor(nowBA.toSeconds())
    const exp = Math.floor(nowBA.plus({ minutes: SESSION_MINUTES }).toSeconds())

    const payload = { userId: user.id, rol: user.rol, iat, exp }
    const token = jwt.sign(payload, JWT_SECRET)

    const res = NextResponse.json(
      {
        message: 'Login exitoso',
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol
        }
      },
      { status: 200, headers: corsBaseHeaders() }
    )

    // 👇 Cookie compartida por admin.arenapress.app y arenapress.app
res.cookies.set('token', token, {
  httpOnly: true,
  sameSite: IS_PROD ? 'none' : 'lax',
  secure: IS_PROD,
  maxAge: SESSION_MINUTES * 60,
  path: '/',
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {})
})


    return res
  } catch (error) {
    console.error('Error en /api/auth/login:', error)
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500, headers: corsBaseHeaders() }
    )
  }
}
