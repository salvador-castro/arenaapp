// C:\Users\salvaCastro\Desktop\arenaapp-admin\src\app\api\auth\register\route.ts

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000'

function corsHeaders(extra: Record<string, string> = {}) {
  return {
    'Access-Control-Allow-Origin': FRONT_ORIGIN,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    ...extra,
  }
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('BODY REGISTER =>', body)

    const {
      nombre,
      apellido,
      email,
      telefono,
      tipo_documento,
      numero_documento,
      password,
    } = body

    if (
      !nombre?.trim() ||
      !apellido?.trim() ||
      !email?.trim() ||
      !password ||
      !tipo_documento ||
      !numero_documento?.trim()
    ) {
      return NextResponse.json(
        { error: 'Faltan campos' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const nombreTrim = nombre.trim()
    const apellidoTrim = apellido.trim()
    const emailTrim = email.trim()
    const docTrim = numero_documento.trim()

    // Validación servidor según tipo de documento
    if (tipo_documento === 'Pasaporte') {
      const passportRegex = /^[A-Za-z0-9]+$/
      if (!passportRegex.test(docTrim)) {
        return NextResponse.json(
          {
            error:
              'Para pasaporte solo se permiten letras y números, sin espacios ni guiones.',
          },
          { status: 400, headers: corsHeaders() }
        )
      }
    } else {
      const numericRegex = /^[0-9]+$/
      if (!numericRegex.test(docTrim)) {
        return NextResponse.json(
          { error: 'El número de documento debe contener solo números.' },
          { status: 400, headers: corsHeaders() }
        )
      }
    }

    // Normalizamos el documento antes de guardar / buscar
    const docNormalized =
      tipo_documento === 'Pasaporte' ? docTrim.toUpperCase() : docTrim

    const db = await getDb()

    const exists = await db.query(
      `
      SELECT email, tipo_documento, numero_documento
      FROM usuarios
      WHERE email = $1
         OR (tipo_documento = $2 AND numero_documento = $3)
      LIMIT 1
      `,
      [emailTrim, tipo_documento, docNormalized]
    )

    if (exists.rows.length > 0) {
      const row = exists.rows[0]

      if (row.email === emailTrim) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 409, headers: corsHeaders() }
        )
      }

      return NextResponse.json(
        { error: 'Ya existe un usuario con ese tipo y número de documento' },
        { status: 409, headers: corsHeaders() }
      )
    }

    const password_hash = await bcrypt.hash(password, 10)

    await db.query(
      `
      INSERT INTO usuarios 
      (nombre, apellido, email, telefono, tipo_documento, numero_documento,
       password_hash, rol, activo, email_verificado, created_at, updated_at)
      VALUES 
      ($1, $2, $3, $4, $5, $6,
       $7, 'USER', true, false, NOW(), NOW())
      `,
      [
        nombreTrim,
        apellidoTrim,
        emailTrim,
        telefono ?? null,
        tipo_documento,
        docNormalized,
        password_hash,
      ]
    )

    return NextResponse.json(
      { message: 'Usuario registrado correctamente' },
      { status: 201, headers: corsHeaders() }
    )
  } catch (err: any) {
    console.error('Error en register:', err)

    // Podés dejar el detalle mientras desarrollás
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        detalle: String(err?.message ?? err),
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}
