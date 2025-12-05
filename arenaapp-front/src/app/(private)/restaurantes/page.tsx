// C:\Users\sacastro\Documents\proyects\arenaapp\arenaapp-front\src\app\(private)\restaurantes\page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import UserDropdown from '@/components/UserDropdown'
import BottomNav from '@/components/BottomNav'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const PUBLIC_RESTAURANTS_ENDPOINT = `${API_BASE}/api/admin/restaurantes/public`

interface Restaurant {
  id: number
  nombre: string
  tipo_comida: string | null
  slug: string | null
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

function priceTierToSymbols (tier?: number | null) {
  if (!tier || tier < 1) return '-'
  return '$'.repeat(Math.min(tier, 5))
}

export default function RestaurantesPage () {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const highlightedIdParam = searchParams?.get('restauranteId')
  const highlightedId = highlightedIdParam ? Number(highlightedIdParam) : null

  // Solo USER y ADMIN
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login?redirect=/restaurantes')
      return
    }
    if (user.rol !== 'USER' && user.rol !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (search.trim()) {
          params.set('search', search.trim())
        }

        const res = await fetch(
          `${PUBLIC_RESTAURANTS_ENDPOINT}${
            params.toString() ? `?${params.toString()}` : ''
          }`
        )

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data = await res.json()
        const list: Restaurant[] = Array.isArray(data) ? data : []

        setRestaurants(list)
      } catch (e: any) {
        console.error('Error cargando restaurantes', e)
        setError('No se pudieron cargar los restaurantes.')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [search])

  if (isLoading || !user) {
    return (
      <div className='min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center'>
        <p className='text-sm text-slate-400'>Cargando...</p>
      </div>
    )
  }

  const hasResults = restaurants.length > 0

  return (
    <div className='min-h-screen bg-slate-950 text-slate-100 pb-20'>
      {/* Header */}
      <header className='sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800'>
        <div className='max-w-4xl mx-auto flex items-center justify-between px-4 py-3'>
          <div>
            <h1 className='text-lg font-semibold'>Restaurantes</h1>
            <p className='text-xs text-slate-400'>
              Explorá los restaurantes recomendados en ArenaApp.
            </p>
          </div>
          <UserDropdown />
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 pt-4 pb-6 space-y-4'>
        {/* Buscador */}
        <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Buscar por nombre, zona, ciudad o tipo de comida...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
            />
          </div>
        </div>

        {/* Mensajes */}
        {loading && (
          <p className='text-xs text-slate-400'>Cargando restaurantes...</p>
        )}

        {error && !loading && (
          <p className='text-xs text-red-400'>{error}</p>
        )}

        {!loading && !error && !hasResults && (
          <p className='text-xs text-slate-400'>
            No encontramos restaurantes que coincidan con la búsqueda.
          </p>
        )}

        {/* Grid de cards */}
        {!loading && !error && hasResults && (
          <div className='grid grid-cols-1 gap-4'>
            {restaurants.map(r => {
              const isHighlighted = highlightedId !== null && r.id === highlightedId

              return (
                <article
                  key={r.id}
                  className={`relative flex gap-3 rounded-2xl border bg-slate-900/60 p-3 shadow-sm hover:bg-slate-900 transition-colors ${
                    isHighlighted
                      ? 'border-emerald-500 shadow-emerald-500/30'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Imagen */}
                  <div className='w-28 h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0'>
                    {r.url_imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.url_imagen}
                        alt={r.nombre}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-[10px] text-slate-500'>
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className='flex-1 min-w-0 flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      {r.es_destacado && (
                        <span className='inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300'>
                          Destacado
                        </span>
                      )}
                      {r.zona && (
                        <span className='text-[10px] uppercase tracking-wide text-slate-400'>
                          {r.zona}
                        </span>
                      )}
                    </div>

                    <h2 className='text-sm font-semibold truncate'>
                      {r.nombre}
                    </h2>

                    <p className='text-[11px] text-slate-400 truncate'>
                      {r.direccion}
                      {r.ciudad ? ` · ${r.ciudad}` : ''}
                    </p>

                    {r.tipo_comida && (
                      <p className='text-[11px] text-slate-400 truncate'>
                        {r.tipo_comida}
                      </p>
                    )}

                    <div className='mt-1 flex items-center gap-3 text-[11px] text-slate-300'>
                      <span>{priceTierToSymbols(r.rango_precios)}</span>
                      <span>
                        {r.estrellas
                          ? '★'.repeat(Math.min(r.estrellas, 5))
                          : 'Sin reviews'}
                      </span>
                    </div>
                  </div>

                  {/* Botón acción */}
                  <div className='flex flex-col justify-end items-end gap-2'>
                    {r.url_maps && (
                      <button
                        type='button'
                        onClick={() => window.open(r.url_maps as string, '_blank')}
                        className='inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-700'
                      >
                        Ver en mapa
                      </button>
                    )}
                    {r.url_instagram && (
                      <button
                        type='button'
                        onClick={() =>
                          window.open(r.url_instagram as string, '_blank')
                        }
                        className='inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20'
                      >
                        Instagram
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
