import { Pool } from 'pg'

// Evitar múltiples instancias del Pool en desarrollo (Hot Reload)
declare global {
  var pgPool: Pool | undefined
}

let pool: Pool

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida')
}

const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // necesario para Supabase en muchos entornos
  },
  max: 5, // nunca va a abrir más de 5 conexiones
  idleTimeoutMillis: 10_000,
}

// Configuración safe para desarrollo
if (process.env.NODE_ENV !== 'production') {
  // En desarrollo, a veces es necesario forzar la aceptación de certificados self-signed
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  if (!global.pgPool) {
    global.pgPool = new Pool(config)
  }
  pool = global.pgPool
} else {
  // Producción
  pool = new Pool(config)
}

export async function getDb() {
  return pool
}
