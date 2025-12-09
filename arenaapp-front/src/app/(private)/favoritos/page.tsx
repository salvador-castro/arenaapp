// C:\Users\sacastro\Documents\proyects\arenaapp\arenaapp-front\src\app\(private)\favoritos\page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'

interface FavoriteRestaurant {
  favorito_id: number
  restaurante_id: number
  nombre: string
  tipo_comida: string | null
  slug: string
  descripcion_corta: string | null
  descripcion_larga: string | null
  direccion: string | null
  url_maps: string | null
  horario_text: string | null
  ciudad: string | null
  provincia: string | null
  zona: string | null
  pais: string | null
  sitio_web: string | null
  rango_precios: number | null
  estrellas: number | null
  es_destacado: boolean
  url_reservas: string | null
  url_reserva: string | null
  url_instagram: string | null
  url_imagen: string | null
  resena: string | null
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const FAVORITOS_RESTAURANTES_ENDPOINT = `${API_BASE}/api/admin/favoritos/restaurantes`

function renderPriceRange(rango: number | null | undefined): string {
  if (!rango || rango < 1) return '-'
  const value = Math.min(Math.max(rango, 1), 5)
  return '$'.repeat(value)
}

function renderStars(estrellas: number | null | undefined): string {
  if (!estrellas || estrellas < 1) return '-'
  const value = Math.min(Math.max(estrellas, 1), 5)
  return '★'.repeat(value)
}

export default function FavoritosPage() {
  const router = useRouter()
  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  // Guardia de auth
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login?redirect=/favoritos')
      return
    }
  }, [user, isLoading, router])

  // Cargar favoritos
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        setLoading(true)
        setError(null)

        const headers: HeadersInit = {}
        if (auth?.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }

        const res = await fetch(FAVORITOS_RESTAURANTES_ENDPOINT, {
          method: 'GET',
          headers,
          credentials: 'include'
        })


        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: FavoriteRestaurant[] = await res.json()
        setFavorites(data)
      } catch (err: any) {
        console.error('Error cargando favoritos', err)
        setError(err.message ?? 'Error al cargar favoritos')
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user, auth?.token])

  const handleRemoveFavorite = async (restauranteId: number) => {
    setRemovingId(restauranteId)
    try {
            const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      if (auth?.token) {
        headers['Authorization'] = `Bearer ${auth.token}`
      }

      const res = await fetch(FAVORITOS_RESTAURANTES_ENDPOINT, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ restauranteId })
      })

      if (!res.ok) {
        console.error('Error al quitar favorito', await res.text())
        return
      }

      setFavorites(prev =>
        prev.filter(f => f.restaurante_id !== restauranteId)
      )
    } catch (err) {
      console.error('Error al quitar favorito', err)
    } finally {
      setRemovingId(null)
    }
  }

  const handleGoToRestaurant = (restauranteId: number) => {
    router.push(`/restaurantes?restauranteId=${restauranteId}`)
  }

  if (isLoading || (!user && !error)) {
    return (
      <div className='min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center'>
        <p className='text-sm text-slate-400'>Cargando...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-950 text-slate-100 pb-20'>
      <TopNav isLoggedIn={isLoggedIn} />

      <main className='max-w-6xl mx-auto px-4 pt-4 pb-6 space-y-4'>
        <header className='flex flex-col gap-1 mb-1'>
          <h1 className='text-lg font-semibold'>Tus favoritos</h1>
          <p className='text-xs text-slate-400'>
            Restaurantes que guardaste para volver a ver.
          </p>
        </header>

        {loading && (
          <p className='text-xs text-slate-400'>Cargando favoritos...</p>
        )}

        {error && <p className='text-xs text-red-400'>{error}</p>}

        {!loading && !error && favorites.length === 0 && (
          <p className='text-xs text-slate-400'>
            Todavía no guardaste restaurantes como favoritos.
          </p>
        )}

        {!loading && !error && favorites.length > 0 && (
          <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {favorites.map(place => (
              <div
                key={place.favorito_id}
                className='rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden'
              >
                <div
                  className='relative w-full h-36 sm:h-40 md:h-44 bg-slate-800 cursor-pointer'
                  onClick={() => handleGoToRestaurant(place.restaurante_id)}
                >
                  <Image
                    alt={place.nombre}
                    src={
                      place.url_imagen ||
                      '/images/placeholders/restaurante-placeholder.jpg'
                    }
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, 25vw'
                  />
                </div>

                <div className='p-3 flex-1 flex flex-col gap-1 text-[11px]'>
                  <p className='text-[10px] uppercase font-semibold text-emerald-400'>
                    {place.zona || 'Zona no especificada'}
                  </p>
                  <h3 className='text-sm font-semibold line-clamp-1'>
                    {place.nombre}
                  </h3>

                  {place.descripcion_corta && (
                    <p className='text-slate-400 line-clamp-2'>
                      {place.descripcion_corta}
                    </p>
                  )}

                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-amber-400'>
                      {renderStars(place.estrellas)}
                    </span>
                    <span className='text-slate-400'>
                      {renderPriceRange(place.rango_precios)}
                    </span>
                  </div>

                  {place.tipo_comida && (
                    <span className='mt-1 inline-flex rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300'>
                      {place.tipo_comida}
                    </span>
                  )}

                  {place.direccion && (
                    <p className='mt-1 text-[10px] text-slate-500 line-clamp-1'>
                      {place.direccion}
                    </p>
                  )}

                  <div className='mt-2 flex justify-between gap-2'>
                    <button
                      type='button'
                      onClick={() =>
                        handleGoToRestaurant(place.restaurante_id)
                      }
                      className='rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors'
                    >
                      Ver detalle
                    </button>

                    <button
                      type='button'
                      onClick={() =>
                        handleRemoveFavorite(place.restaurante_id)
                      }
                      disabled={removingId === place.restaurante_id}
                      className='rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300 hover:border-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {removingId === place.restaurante_id
                        ? 'Quitando...'
                        : 'Quitar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
