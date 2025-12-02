// C:\Users\salvaCastro\Desktop\arenaapp-front\src\lib\db.ts
// Lo renombramos como cliente Supabase (no MySQL)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el .env.local del front')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
