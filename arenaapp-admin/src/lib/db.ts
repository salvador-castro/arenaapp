// src/lib/db.ts (arenaapp-admin)
import { Pool } from 'pg'

let pool: Pool | null = null

export async function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida')
  }

  if (!pool) {
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
