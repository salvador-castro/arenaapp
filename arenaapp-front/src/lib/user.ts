// C:\Users\salvaCastro\Desktop\arenaapp-front\src\lib\user.ts

export interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: string

  // todo lo demás como opcional
  bio?: string
  username?: string
  ciudad?: string
  pais?: string
  telefono?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}


// Base del backend admin (3001). Le sacamos la barra final por las dudas.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '')

export async function getCurrentUser (): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/perfil`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    })

    if (res.status === 401 || res.status === 403) {
      return null
    }

    if (!res.ok) {
      console.error('Error al obtener perfil:', await res.text())
      return null
    }

    const data = (await res.json()) as User

    // ⚠️ Normalizamos avatar_url: si viene relativo (/uploads/...), le agregamos el host 3001
    if (data.avatar_url && !data.avatar_url.startsWith('http')) {
      data.avatar_url = `${API_BASE}${data.avatar_url}`
    }

    return data
  } catch (err) {
    console.error('Error de red en getCurrentUser:', err)
    return null
  }
}
