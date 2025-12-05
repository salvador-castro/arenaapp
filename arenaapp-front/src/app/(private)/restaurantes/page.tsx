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

const PUBLIC_RESTAURANTS_ENDPOINT = `${API_BASE}/api/restaurantes`

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

function starsToSymbols (stars?: number | null) {
  if (!stars || stars < 1) return '-'
  return '★'.repeat(Math.min(stars, 5))
}

export default function RestaurantesPage () {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Restaurant | null>(null)

  // 🔐 Solo usuarios logueados con perfil USER o ADMIN
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login?redirect=/restaurantes')
      return
    }

    if (user.rol !== 'USER' && user.rol !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  // Cargar restaurantes públicos
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (search.trim()) {
          params.set('search', search.trim())
        }

        const url = params.toString()
          ? `${PUBLIC_RESTAURANTS_ENDPOINT}?${params.toString()}`
          : PUBLIC_RESTAURANTS_ENDPOINT

        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data = await res.json()
        const list: Restaurant[] = Array.isArray(data) ? data : []

        setRestaurants(list)
      } catch (e: any) {
        console.error('Error cargando restaurantes públicos', e)
        setError('No se pudieron cargar los restaurantes.')
      } finally {
        setLoading(false)
      }
    }

    // Solo buscar si el user está autorizado
    if (user && (user.rol === 'USER' || user.rol === 'ADMIN')) {
      fetchRestaurants()
    }
  }, [user, search])

  // Si viene con ?restauranteId= desde el dashboard → abrir modal
  useEffect(() => {
    const restauranteId = searchParams.get('restauranteId')
    if (!restauranteId || restaurants.length === 0) return

    const found = restaurants.find(r => String(r.id) === restauranteId)
    if (found) {
      setSelected(found)
    }
  }, [searchParams, restaurants])

  const handleCardClick = (restaurant: Restaurant) => {
    // Acá ya sabemos que está logueado (protección arriba),
    // así que simplemente abrimos el modal.
    setSelected(restaurant)
  }

  const closeModal = () => {
    setSelected(null)
  }

  if (isLoading || !user) {
    return (
      <div className='min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center'>
        <p className='text-sm text-slate-400'>Cargando...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-950 text-slate-100 pb-20'>
      {/* Header */}
      <header className='sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800'>
        <div className='max-w-4xl mx-auto flex items-center justify-between px-4 py-3'>
          <div>
            <h1 className='text-lg font-semibold'>Restaurantes</h1>
            <p className='text-xs text-slate-400'>
              Explorá todos los restaurantes cargados en ArenaApp.
            </p>
          </div>
          <UserDropdown />
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 pt-4 pb-6 space-y-4'>
        {/* Buscador simple */}
        <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
          <input
            type='text'
            placeholder='Buscar por nombre, tipo de comida, zona...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
          />
        </div>

        {/* Mensajes */}
        {error && (
          <div className='rounded-xl border border-red-700 bg-red-950/50 px-3 py-2 text-xs text-red-200'>
            {error}
          </div>
        )}

        {loading && (
          <p className='text-xs text-slate-400'>Cargando restaurantes...</p>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <p className='text-xs text-slate-400'>
            No se encontraron restaurantes. Probá cambiando la búsqueda.
          </p>
        )}

        {/* Grid de cards */}
        {!loading && !error && restaurants.length > 0 && (
          <div className='grid grid-cols-1 gap-4'>
            {restaurants.map(r => (
              <button
                key={r.id}
                type='button'
                onClick={() => handleCardClick(r)}
                className='w-full text-left rounded-2xl overflow-hidden bg-slate-900/70 border border-slate-800 hover:border-emerald-500/70 hover:bg-slate-900 transition-colors'
              >
                {/* Imagen */}
                <div className='w-full h-40 overflow-hidden'>
                  {/* Usá <img> simple para evitar problemas de next/image con rutas relativas */}
                  <img
                    src={
                      r.url_imagen ||
                      '/images/placeholders/restaurante-placeholder.jpg'
                    }
                    alt={r.nombre}
                    className='w-full h-full object-cover'
                  />
                </div>

                {/* Contenido */}
                <div className='px-4 py-3 space-y-1.5'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex flex-col gap-0.5 min-w-0'>
                      <p className='text-[10px] uppercase font-semibold text-emerald-400 truncate'>
                        {r.zona || r.ciudad || 'Zona no especificada'}
                      </p>
                      <h2 className='font-semibold text-sm truncate'>
                        {r.nombre}
                      </h2>
                    </div>
                    <div className='text-right text-[11px] text-yellow-300'>
                      <div>{starsToSymbols(r.estrellas)}</div>
                      <div className='text-[10px] text-slate-400'>
                        {priceTierToSymbols(r.rango_precios)}
                      </div>
                    </div>
                  </div>

                  {r.descripcion_corta && (
                    <p className='text-[11px] text-slate-300 line-clamp-2'>
                      {r.descripcion_corta}
                    </p>
                  )}

                  <div className='flex items-center justify-between pt-1'>
                    <span className='text-[10px] text-slate-500'>
                      {r.horario_text || 'Horario no informado'}
                    </span>
                    <span className='text-[11px] text-emerald-400 font-medium'>
                      Ver más detalles
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Modal de detalle */}
        {selected && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4'>
            <div className='w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col'>
              {/* Header modal */}
              <div className='flex items-center justify-between px-4 py-3 border-b border-slate-800'>
                <div className='min-w-0'>
                  <p className='text-[10px] uppercase font-semibold text-emerald-400 truncate'>
                    {selected.zona || selected.ciudad || 'Zona no especificada'}
                  </p>
                  <h2 className='text-sm font-semibold truncate'>
                    {selected.nombre}
                  </h2>
                </div>
                <button
                  type='button'
                  onClick={closeModal}
                  className='text-slate-400 hover:text-slate-100 text-lg leading-none'
                >
                  ✕
                </button>
              </div>

              {/* Scroll interno */}
              <div className='flex-1 overflow-y-auto'>
                {/* Imagen grande */}
                <div className='w-full h-52 overflow-hidden'>
                  <img
                    src={
                      selected.url_imagen ||
                      '/images/placeholders/restaurante-placeholder.jpg'
                    }
                    alt={selected.nombre}
                    className='w-full h-full object-cover'
                  />
                </div>

                <div className='px-4 py-4 space-y-3'>
                  {/* Info rápida */}
                  <div className='flex items-center justify-between text-[11px]'>
                    <div className='space-y-0.5'>
                      <p className='text-slate-300'>
                        {starsToSymbols(selected.estrellas)}{' '}
                        <span className='text-slate-500'>
                          • {priceTierToSymbols(selected.rango_precios)}
                        </span>
                      </p>
                      {selected.tipo_comida && (
                        <p className='text-slate-400'>
                          {selected.tipo_comida}
                        </p>
                      )}
                    </div>
                    {selected.es_destacado && (
                      <span className='inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-[10px] font-semibold text-emerald-300 uppercase tracking-wide'>
                        Destacado
                      </span>
                    )}
                  </div>

                  {/* Dirección */}
                  <div className='text-[11px] text-slate-300 space-y-0.5'>
                    <p className='font-semibold text-slate-200'>Dirección</p>
                    <p>
                      {selected.direccion || 'Dirección no informada'}
                      {selected.ciudad ? `, ${selected.ciudad}` : ''}
                      {selected.provincia ? `, ${selected.provincia}` : ''}
                      {selected.pais ? `, ${selected.pais}` : ''}
                    </p>
                  </div>

                  {/* Horario */}
                  <div className='text-[11px] text-slate-300 space-y-0.5'>
                    <p className='font-semibold text-slate-200'>Horarios</p>
                    <p>{selected.horario_text || 'No informado'}</p>
                  </div>

                  {/* Reseña */}
                  {selected.resena && (
                    <div className='text-[11px] text-slate-300 space-y-0.5'>
                      <p className='font-semibold text-slate-200'>Reseña</p>
                      <p className='whitespace-pre-line'>
                        {selected.resena}
                      </p>
                    </div>
                  )}

                  {/* Links */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2'>
                    {selected.url_maps && (
                      <a
                        href={selected.url_maps}
                        target='_blank'
                        rel='noreferrer'
                        className='text-[11px] text-center rounded-xl border border-slate-700 px-3 py-2 text-emerald-300 hover:bg-slate-900'
                      >
                        Ver en Google Maps
                      </a>
                    )}
                    {selected.url_reserva && (
                      <a
                        href={selected.url_reserva}
                        target='_blank'
                        rel='noreferrer'
                        className='text-[11px] text-center rounded-xl border border-emerald-600/70 bg-emerald-600/10 px-3 py-2 text-emerald-300 hover:bg-emerald-600/20'
                      >
                        Reservar mesa
                      </a>
                    )}
                    {selected.url_instagram && (
                      <a
                        href={selected.url_instagram}
                        target='_blank'
                        rel='noreferrer'
                        className='text-[11px] text-center rounded-xl border border-slate-700 px-3 py-2 text-emerald-300 hover:bg-slate-900'
                      >
                        Ver en Instagram
                      </a>
                    )}
                    {selected.sitio_web && (
                      <a
                        href={selected.sitio_web}
                        target='_blank'
                        rel='noreferrer'
                        className='text-[11px] text-center rounded-xl border border-slate-700 px-3 py-2 text-emerald-300 hover:bg-slate-900'
                      >
                        Sitio web
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
