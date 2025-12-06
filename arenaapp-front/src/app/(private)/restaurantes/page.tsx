'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Instagram } from 'lucide-react'

import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/BottomNav'
import UserDropdown from '@/components/UserDropdown'
import TipoComidaMultiSelect from '@/components/TipoComidaRestaurantes'

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

  // tu AuthContext realmente expone { auth, isLoading }
  const { auth, isLoading }: any = useAuth()
  const user = auth?.user

  const restauranteIdParam = searchParams.get('restauranteId')

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [search, setSearch] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>([])

  // 🔐 Obligatorio estar logueado (USER o ADMIN)
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const redirectUrl = restauranteIdParam
        ? `/restaurantes?restauranteId=${restauranteIdParam}`
        : '/restaurantes'

      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }
  }, [user, isLoading, router, restauranteIdParam])

  // 📥 Cargar TODOS los restaurantes públicos
  useEffect(() => {
    if (!user) return

    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${API_BASE}/api/admin/restaurantes/public`, {
          method: 'GET'
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Restaurant[] = await res.json()
        setRestaurants(data)
      } catch (err: any) {
        console.error('Error cargando restaurantes públicos', err)
        setError(err.message ?? 'Error al cargar los restaurantes')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [user])

  // 🔁 Si viene restauranteId por query y ya tengo la lista, abro el modal
  useEffect(() => {
    if (!restaurants.length) return
    if (!restauranteIdParam) return

    const idNum = Number(restauranteIdParam)
    if (Number.isNaN(idNum)) return

    const r = restaurants.find(rest => rest.id === idNum)
    if (r) {
      setSelectedRestaurant(r)
      setIsModalOpen(true)
    }
  }, [restaurants, restauranteIdParam])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRestaurant(null)
    router.push('/restaurantes')
  }

  // Opciones de zona para el select (únicas, no nulas)
  const zonasOptions = useMemo(
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

  // Lista filtrada según buscador + zona + precio + tipos de comida
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      // Buscador
      const term = search.trim().toLowerCase()
      if (term) {
        const hayMatch =
          r.nombre.toLowerCase().includes(term) ||
          (r.zona ?? '').toLowerCase().includes(term) ||
          (r.ciudad ?? '').toLowerCase().includes(term) ||
          (r.tipo_comida ?? '').toLowerCase().includes(term)
        if (!hayMatch) return false
      }

      // Zona
      if (zonaFilter && r.zona !== zonaFilter) return false

      // Rango de precios (1–5)
      if (priceFilter) {
        const priceNumber = Number(priceFilter)
        if (Number.isNaN(priceNumber)) return false
        if ((r.rango_precios ?? 0) !== priceNumber) return false
      }

      // Multi-select tipo de comida
      if (tiposSeleccionados.length > 0) {
        const tiposRest = (r.tipo_comida ?? '')
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(Boolean)

        const hayInterseccion = tiposSeleccionados.some(t =>
          tiposRest.includes(t.toLowerCase())
        )

        if (!hayInterseccion) return false
      }

      return true
    })
  }, [restaurants, search, zonaFilter, priceFilter, tiposSeleccionados])

  if (isLoading || (!user && !error)) {
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
              Explorá todos los lugares recomendados.
            </p>
          </div>
          <UserDropdown />
        </div>
      </header>

      {/* Contenido */}
      <main className='max-w-4xl mx-auto px-4 pt-4 pb-6 space-y-4'>
        {/* Filtros */}
        <section className='space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3'>
          <h2 className='text-sm font-semibold text-slate-100'>
            Filtrar restaurantes
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {/* Buscador */}
            <div className='flex flex-col gap-1'>
              <label className='text-[11px] font-medium text-slate-400'>
                Buscar
              </label>
              <input
                type='text'
                className='w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/70'
                placeholder='Nombre, zona, ciudad...'
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Zona */}
            <div className='flex flex-col gap-1'>
              <label className='text-[11px] font-medium text-slate-400'>
                Zona
              </label>
              <select
                className='w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/70'
                value={zonaFilter}
                onChange={e => setZonaFilter(e.target.value)}
              >
                <option value=''>Todas las zonas</option>
                {zonasOptions.map(zona => (
                  <option key={zona} value={zona}>
                    {zona}
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de precios */}
            <div className='flex flex-col gap-1'>
              <label className='text-[11px] font-medium text-slate-400'>
                Rango de precios
              </label>
              <select
                className='w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/70'
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
              >
                <option value=''>Todos</option>
                <option value='1'>$</option>
                <option value='2'>$$</option>
                <option value='3'>$$$</option>
                <option value='4'>$$$$</option>
                <option value='5'>$$$$$</option>
              </select>
            </div>

            {/* Multi-select tipo de comida */}
            <div className='flex flex-col gap-1'>
              <label className='text-[11px] font-medium text-slate-400'>
                Tipo de comida
              </label>
              <TipoComidaMultiSelect
                selected={tiposSeleccionados}
                onChange={setTiposSeleccionados}
              />
            </div>
          </div>
        </section>

        {/* Estado de carga / error */}
        {loading && (
          <p className='text-xs text-slate-400'>Cargando restaurantes...</p>
        )}

        {error && <p className='text-xs text-red-400'>{error}</p>}

        {/* Grid de cards (tipo C) */}
        {!loading && !error && filteredRestaurants.length === 0 && (
          <p className='text-xs text-slate-400'>
            No se encontraron restaurantes con los filtros actuales.
          </p>
        )}

        {!loading && !error && filteredRestaurants.length > 0 && (
          <section className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            {filteredRestaurants.map(r => (
              <button
                key={r.id}
                type='button'
                onClick={() => {
                  setSelectedRestaurant(r)
                  setIsModalOpen(true)
                  // actualizo query param por si recarga / comparte link
                  const params = new URLSearchParams(
                    Array.from(searchParams.entries())
                  )
                  params.set('restauranteId', String(r.id))
                  router.push(`/restaurantes?${params.toString()}`)
                }}
                className='group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-emerald-500/70 hover:bg-slate-900 transition-colors'
              >
                <div className='relative w-full aspect-[4/3] bg-slate-800'>
                  <Image
                    alt={r.nombre}
                    src={
                      r.url_imagen ||
                      '/images/placeholders/restaurante-placeholder.jpg'
                    }
                    fill
                    className='object-cover group-hover:scale-[1.03] transition-transform'
                    sizes='(max-width: 640px) 50vw, 33vw'
                  />
                </div>

                <div className='px-2.5 py-2 flex flex-col gap-1'>
                  <p className='text-[10px] uppercase font-semibold text-emerald-400 line-clamp-1'>
                    {r.zona || 'Zona no especificada'}
                  </p>
                  <p className='text-xs font-semibold line-clamp-1'>
                    {r.nombre}
                  </p>

                  <div className='flex items-center justify-between text-[10px] mt-1'>
                    <span className='text-amber-400'>
                      {renderStars(r.estrellas)}
                    </span>
                    <span className='text-slate-400'>
                      {renderPriceRange(r.rango_precios)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </section>
        )}

        {/* Modal de detalle */}
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
