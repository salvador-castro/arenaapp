import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

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
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

// GET /api/debug/db
export async function GET (req: NextRequest) {
  try {
    const db = await getDb()

    const { rows } = await db.query('SELECT now() as ahora')

    return NextResponse.json(
      {
        ok: true,
        ahora: rows[0]?.ahora ?? null
      },
      {
        status: 200,
        headers: {
          ...corsBaseHeaders()
        }
      }
    )
  } catch (error: any) {
    console.error('DEBUG DB ERROR:', error)

    return NextResponse.json(
      {
        ok: false,
        error: String(error)
      },
      {
        status: 500,
        headers: {
          ...corsBaseHeaders()
        }
      }
    )
  }
}
