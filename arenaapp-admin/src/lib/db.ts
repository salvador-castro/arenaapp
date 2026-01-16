// src/lib/db.ts (arenaapp-admin)
import { Pool } from 'pg'

let pool: Pool | null = null

export async function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida')
  }

  if (!pool) {
    // En desarrollo, a veces es necesario forzar la aceptación de certificados self-signed
    // si la configuración de ssl: { rejectUnauthorized: false } no es suficiente.
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // necesario para Supabase en muchos entornos
      },
      // 👇 muy importante para no romper el pool de Supabase
      max: 5, // nunca va a abrir más de 5 conexiones
      idleTimeoutMillis: 10_000,
    })
  }

  return pool
}
