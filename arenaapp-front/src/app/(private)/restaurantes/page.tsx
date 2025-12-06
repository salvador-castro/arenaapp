'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { Instagram, SlidersHorizontal } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import UserDropdown from '@/components/UserDropdown'

interface Restaurant {
  id: number
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

const PUBLIC_ENDPOINT = `${API_BASE}/api/admin/restaurantes/public`

function renderPriceRange (rango: number | null | undefined): string {
  if (!rango || rango < 1) return '-'
  const value = Math.min(Math.max(rango, 1), 5)
  return '$'.repeat(value)
}

function renderStars (estrellas: number | null | undefined): string {
  if (!estrellas || estrellas < 1) return '-'
  const value = Math.min(Math.max(estrellas, 1), 5)
  return '★'.repeat(value)
}

function getInstagramHandle (url: string | null): string {
  if (!url) return 'Instagram'
  try {
    const u = new URL(url)
    const cleanPath = u.pathname.replace(/\/$/, '')
    const last = cleanPath.split('/').filter(Boolean).pop()
    return last || 'Instagram'
  } catch {
    return 'Instagram'
  }
}

export default function RestaurantesPage () {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 👈 AHORA usamos user directo del contexto
  const { user, isLoading }: any = useAuth()

  const restauranteIdParam = searchParams.get('restauranteId')
  const restauranteId = restauranteIdParam ? Number(restauranteIdParam) : null

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtros
  const [search, setSearch] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [tiposFilter, setTiposFilter] = useState<string[]>([])

  // 1) Guardia de auth: obliga a estar logueado
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const redirectUrl = restauranteId
        ? `/restaurantes?restauranteId=${restauranteId}`
        : '/restaurantes'

      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }
  }, [user, isLoading, router, restauranteId])

  // 2) Cargar TODOS los restaurantes PUBLICADOS (endpoint público)
  useEffect(() => {
    if (!user) return

    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(PUBLIC_ENDPOINT, {
          method: 'GET'
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Restaurant[] = await res.json()
        setRestaurants(data)
      } catch (err: any) {
        console.error('Error cargando restaurantes públicos', err)
        setError(err.message ?? 'Error al cargar restaurantes')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [user])

  // 3) Si venimos con ?restauranteId=9 desde el dashboard, abrir ese modal
  useEffect(() => {
    if (!restaurants.length) return
    if (!restauranteId) return

    const found = restaurants.find(r => r.id === restauranteId)
    if (found) {
      setSelectedRestaurant(found)
      setIsModalOpen(true)
    }
  }, [restaurants, restauranteId])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRestaurant(null)
    router.push('/restaurantes')
  }

  // 4) Opciones dinámicas para filtros
  const zonas = useMemo(
    () =>
      Array.from(
        new Set(
          restaurants
            .map(r => r.zona)
            .filter((z): z is string => !!z && z.trim().length > 0)
        )
      ).sort(),
    [restaurants]
  )

  const precios = useMemo(
    () =>
      Array.from(
        new Set(
          restaurants
            .map(r => r.rango_precios)
            .filter(
              (p): p is number => typeof p === 'number' && !Number.isNaN(p)
            )
        )
      ).sort((a, b) => a - b),
    [restaurants]
  )

  const tiposComida = useMemo(
    () =>
      Array.from(
        new Set(
          restaurants
            .map(r => r.tipo_comida)
            .filter((t): t is string => !!t && t.trim().length > 0)
        )
      ).sort(),
    [restaurants]
  )

  // 5) Aplicar filtros
  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants]

    const term = search.trim().toLowerCase()
    if (term) {
      result = result.filter(r => {
        const nombre = r.nombre.toLowerCase()
        const tipo = (r.tipo_comida || '').toLowerCase()
        const zona = (r.zona || '').toLowerCase()
        const ciudad = (r.ciudad || '').toLowerCase()
        return (
          nombre.includes(term) ||
          tipo.includes(term) ||
          zona.includes(term) ||
          ciudad.includes(term)
        )
      })
    }

    if (zonaFilter) {
      result = result.filter(r => r.zona === zonaFilter)
    }

    if (priceFilter) {
      const priceNumber = Number(priceFilter)
      if (!Number.isNaN(priceNumber)) {
        result = result.filter(r => r.rango_precios === priceNumber)
      }
    }

    if (tiposFilter.length > 0) {
      result = result.filter(
        r => r.tipo_comida && tiposFilter.includes(r.tipo_comida)
      )
    }

    result.sort((a, b) => {
      if (a.es_destacado && !b.es_destacado) return -1
      if (!a.es_destacado && b.es_destacado) return 1

      const ea = a.estrellas || 0
      const eb = b.estrellas || 0
      if (eb !== ea) return eb - ea

      return a.nombre.localeCompare(b.nombre)
    })

    return result
  }, [restaurants, search, zonaFilter, priceFilter, tiposFilter])

  const toggleTipoComida = (tipo: string) => {
    setTiposFilter(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    )
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
      <header className='sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800'>
        <div className='max-w-4xl mx-auto flex items-center justify-between px-4 py-3'>
          <div>
            <h1 className='text-lg font-semibold'>Restaurantes</h1>
            <p className='text-xs text-slate-400'>
              Explorá los lugares recomendados.
            </p>
          </div>
          <UserDropdown />
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 pt-4 pb-6 space-y-4'>
        {/* Filtros */}
        <section className='rounded-2xl border border-slate-800 bg-slate-900/40 p-3 space-y-3'>
          <div className='flex items-center justify-between gap-2'>
            <h2 className='text-sm font-semibold flex items-center gap-2'>
              <SlidersHorizontal size={14} />
              <span>Filtros</span>
            </h2>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {/* Buscador */}
            <div className='sm:col-span-1'>
              <label className='block text-[11px] font-medium text-slate-300 mb-1'>
                Buscar
              </label>
              <input
                type='text'
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Nombre, zona, ciudad...'
                className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
              />
            </div>

            {/* Zona */}
            <div>
              <label className='block text-[11px] font-medium text-slate-300 mb-1'>
                Zona
              </label>
              <select
                value={zonaFilter}
                onChange={e => setZonaFilter(e.target.value)}
                className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
              >
                <option value=''>Todas</option>
                {zonas.map(z => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de precios */}
            <div>
              <label className='block text-[11px] font-medium text-slate-300 mb-1'>
                Rango de precios
              </label>
              <select
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
              >
                <option value=''>Todos</option>
                {precios.map(p => (
                  <option key={p} value={p}>
                    {renderPriceRange(p)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multiselect tipo de comida */}
          {tiposComida.length > 0 && (
            <div className='space-y-1'>
              <p className='text-[11px] font-medium text-slate-300'>
                Tipo de comida
              </p>
              <div className='flex flex-wrap gap-2'>
                {tiposComida.map(tipo => {
                  const active = tiposFilter.includes(tipo)
                  return (
                    <button
                      key={tipo}
                      type='button'
                      onClick={() => toggleTipoComida(tipo)}
                      className={`rounded-full border px-3 py-1 text-[11px] ${
                        active
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                          : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-emerald-400/60'
                      }`}
                    >
                      {tipo}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        {/* Estado de carga / error */}
        {loading && (
          <p className='text-xs text-slate-400'>Cargando restaurantes...</p>
        )}

        {error && <p className='text-xs text-red-400'>{error}</p>}

        {/* Listado */}
        {!loading && !error && filteredRestaurants.length === 0 && (
          <p className='text-xs text-slate-400'>
            No se encontraron restaurantes con los filtros actuales.
          </p>
        )}

        {!loading && !error && filteredRestaurants.length > 0 && (
          <section className='grid grid-cols-1 gap-3'>
            {filteredRestaurants.map(place => (
              <button
                key={place.id}
                type='button'
                onClick={() => {
                  setSelectedRestaurant(place)
                  setIsModalOpen(true)
                  router.push(`/restaurantes?restauranteId=${place.id}`)
                }}
                className='text-left rounded-2xl border border-slate-800 bg-slate-900/50 p-3 flex gap-3 hover:border-emerald-500/60 transition-colors'
              >
                <div className='relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-800'>
                  <Image
                    alt={place.nombre}
                    src={
                      place.url_imagen ||
                      '/images/placeholders/restaurante-placeholder.jpg'
                    }
                    fill
                    className='object-cover'
                    sizes='96px'
                  />
                </div>

                <div className='flex-1 flex flex-col gap-1 text-[11px]'>
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

                  <div className='flex items-center gap-2'>
                    <span className='text-amber-400'>
                      {renderStars(place.estrellas)}
                    </span>
                    <span className='text-slate-400'>
                      {renderPriceRange(place.rango_precios)}
                    </span>
                    {place.tipo_comida && (
                      <span className='rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300'>
                        {place.tipo_comida}
                      </span>
                    )}
                  </div>

                  {place.direccion && (
                    <p className='text-[10px] text-slate-500 line-clamp-1'>
                      {place.direccion}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </section>
        )}

        {/* MODAL detalle */}
        {isModalOpen && selectedRestaurant && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4'>
            <div className='relative w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 shadow-xl'>
              <button
                type='button'
                onClick={closeModal}
                className='absolute right-3 top-3 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700'
              >
                ✕
              </button>

              <div className='p-4 sm:p-6 space-y-4'>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <div className='relative w-full sm:w-40 h-32 sm:h-40 rounded-xl overflow-hidden bg-slate-800'>
                    <Image
                      alt={selectedRestaurant.nombre}
                      src={
                        selectedRestaurant.url_imagen ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 100vw, 160px'
                    />
                  </div>

                  <div className='flex-1 space-y-1'>
                    <p className='text-[11px] uppercase font-semibold text-emerald-400'>
                      {selectedRestaurant.zona || 'Zona no especificada'}
                    </p>
                    <h3 className='text-lg font-semibold'>
                      {selectedRestaurant.nombre}
                    </h3>
                    <div className='flex flex-wrap items-center gap-2 text-[12px]'>
                      <span className='text-amber-400'>
                        {renderStars(selectedRestaurant.estrellas)}
                      </span>
                      <span className='text-slate-400'>
                        {renderPriceRange(selectedRestaurant.rango_precios)}
                      </span>
                      {selectedRestaurant.tipo_comida && (
                        <span className='rounded-full border border-slate-700 px-2 py-[2px] text-[11px] text-slate-300'>
                          {selectedRestaurant.tipo_comida}
                        </span>
                      )}
                    </div>

                    {selectedRestaurant.url_instagram && (
                      <a
                        href={selectedRestaurant.url_instagram}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1'
                      >
                        <Instagram size={14} />
                        <span>
                          @
                          {getInstagramHandle(selectedRestaurant.url_instagram)}
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                {selectedRestaurant.resena && (
                  <div className='space-y-1'>
                    <h4 className='text-sm font-semibold'>Reseña</h4>
                    <p className='text-[12px] text-slate-300 whitespace-pre-line'>
                      {selectedRestaurant.resena}
                    </p>
                  </div>
                )}

                <div className='grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]'>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Dirección
                    </p>
                    <p className='text-slate-400'>
                      {selectedRestaurant.direccion || '-'}
                    </p>
                    {selectedRestaurant.url_maps && (
                      <a
                        href={selectedRestaurant.url_maps}
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 mt-1 inline-block'
                      >
                        Cómo llegar
                      </a>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Horario
                    </p>
                    <p className='text-slate-400'>
                      {selectedRestaurant.horario_text || '-'}
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Sitio web
                    </p>
                    {selectedRestaurant.sitio_web ? (
                      <a
                        href={selectedRestaurant.sitio_web}
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                      >
                        {selectedRestaurant.sitio_web}
                      </a>
                    ) : (
                      <p className='text-slate-400'>-</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Reservas
                    </p>
                    {selectedRestaurant.url_reservas ||
                    selectedRestaurant.url_reserva ? (
                      <a
                        href={
                          selectedRestaurant.url_reservas ||
                          selectedRestaurant.url_reserva ||
                          '#'
                        }
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                      >
                        Hacer reserva
                      </a>
                    ) : (
                      <p className='text-slate-400'>-</p>
                    )}
                  </div>
                </div>

                <div className='flex justify-end pt-2'>
                  <button
                    type='button'
                    onClick={closeModal}
                    className='rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800'
                  >
                    Cerrar
                  </button>
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
