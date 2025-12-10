// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\api\auth\logout\route.ts
import { NextResponse } from 'next/server'

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

export async function POST() {
  const res = NextResponse.json(
    { message: 'Logout OK' },
    { status: 200, headers: corsBaseHeaders() }
  )

  // Borramos la cookie con el mismo dominio y path
res.cookies.set('token', '', {
  httpOnly: true,
  sameSite: IS_PROD ? 'none' : 'lax',
  secure: IS_PROD,
  maxAge: 0,
  path: '/',
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {})
})


  return res
}
