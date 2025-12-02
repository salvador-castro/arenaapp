// C:\Users\salvaCastro\Desktop\arenaapp-admin\src\lib\db.ts
import { Pool } from 'pg'

let pool: Pool

export function getDb () {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // necesario para Supabase
      }
    })
  }

  return pool
}
