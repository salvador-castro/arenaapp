// src/lib/restaurantes.ts
export type Restaurante = {
  id: number
  nombre: string
  slug: string
  ciudad: string | null
  provincia: string | null
  pais: string | null
  precio_promedio: string | number | null
  moneda: string | null
  es_destacado: 0 | 1
  url_imagen: string | null
  estado: string
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

export async function fetchRestaurantes (search = ''): Promise<Restaurante[]> {
  const url = new URL(`${API_BASE}/api/restaurantes`)
  if (search) url.searchParams.set('search', search)

  const res = await fetch(url.toString(), {
    credentials: 'include',
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Error al cargar restaurantes')
  }

  return res.json()
}

export async function createRestaurante (formData: FormData) {
  const res = await fetch(`${API_BASE}/api/restaurantes`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Error al crear restaurante')
  }

  return res.json()
}

export async function updateRestaurante (id: number, formData: FormData) {
  const res = await fetch(`${API_BASE}/api/restaurantes/${id}`, {
    method: 'PUT',
    body: formData,
    credentials: 'include'
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Error al actualizar restaurante')
  }

  return res.json()
}

export async function deleteRestaurante (id: number) {
  const res = await fetch(`${API_BASE}/api/restaurantes/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })

  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Error al eliminar restaurante')
  }
}
