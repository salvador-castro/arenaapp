'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { Instagram, SlidersHorizontal, ChevronDown } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import UserDropdown from '@/components/UserDropdown'

interface Bar {
  id: number | string
  nombre: string
  slug: string
  descripcion_corta: string | null
  descripcion_larga: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  pais: string | null
  zona: string | null
  tipo_comida: string | null
  rango_precios: number | null
  estrellas: number | null
  es_destacado: boolean
  sitio_web: string | null
  instagram: string | null
  facebook: string | null
  url_imagen: string | null
  imagen_principal: string | null
  url_reserva: string | null
  url_maps: string | null
  horario_text: string | null
  resena: string | null
  tiene_terraza?: boolean | null
  tiene_musica_vivo?: boolean | null
  tiene_happy_hour?: boolean | null
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

// ⬇️ ajustá este endpoint si tu API usa otro path
const PUBLIC_ENDPOINT = `${API_BASE}/api/admin/bares/public`
const PAGE_SIZE = 12

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

function normalizeText (value: string | null | undefined): string {
  if (!value) return ''
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function BaresPage () {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null

  const barIdParam = searchParams.get('barId')
  const barId = barIdParam ? Number(barIdParam) : null

  const [bars, setBars] = useState<Bar[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedBar, setSelectedBar] = useState<Bar | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtros
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [tiposFilter, setTiposFilter] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // 1) Guardia de auth
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const redirectUrl = barId ? `/bares?barId=${barId}` : '/bares'
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }
  }, [user, isLoading, router, barId])

  // 2) Traer todos los bares PUBLICADOS
  useEffect(() => {
    if (!user) return

    const fetchBars = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(PUBLIC_ENDPOINT, {
          method: 'GET'
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Bar[] = await res.json()
        setBars(data)
      } catch (err: any) {
        console.error('Error cargando bares públicos', err)
        setError(err.message ?? 'Error al cargar bares')
      } finally {
        setLoading(false)
      }
    }

    fetchBars()
  }, [user])

  // 3) Si venimos con ?barId=, abrir ese modal cuando ya hay data
  useEffect(() => {
    if (!bars.length) return
    if (!barId) return

    const found = bars.find(b => Number(b.id) === Number(barId))

    if (found) {
      setSelectedBar(found)
      setIsModalOpen(true)
    }
  }, [bars, barId])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedBar(null)
    router.push('/bares')
  }

  const openModalFromCard = (place: Bar) => {
    setSelectedBar(place)
    setIsModalOpen(true)
    router.push(`/bares?barId=${place.id}`)
  }

  // 4) Opciones dinámicas para filtros
  const zonas = useMemo(
    () =>
      Array.from(
        new Set(
          bars
            .map(b => b.zona)
            .filter((z): z is string => !!z && z.trim().length > 0)
        )
      ).sort(),
    [bars]
  )

  const precios = useMemo(
    () =>
      Array.from(
        new Set(
          bars
            .map(b => b.rango_precios)
            .filter(
              (p): p is number => typeof p === 'number' && !Number.isNaN(p)
            )
        )
      ).sort((a, b) => a - b),
    [bars]
  )

  const tiposComida = useMemo(
    () =>
      Array.from(
        new Set(
          bars
            .map(b => b.tipo_comida)
            .filter((t): t is string => !!t && t.trim().length > 0)
        )
      ).sort(),
    [bars]
  )

  // 5) Aplicar filtros y orden (destacados primero)
  const filteredBars = useMemo(() => {
    let result = [...bars]

    const term = normalizeText(search.trim())
    if (term) {
      result = result.filter(b => {
        const nombre = normalizeText(b.nombre)
        const tipo = normalizeText(b.tipo_comida)
        const zona = normalizeText(b.zona)
        const ciudad = normalizeText(b.ciudad)
        return (
          nombre.includes(term) ||
          tipo.includes(term) ||
          zona.includes(term) ||
          ciudad.includes(term)
        )
      })
    }

    if (zonaFilter) {
      result = result.filter(b => b.zona === zonaFilter)
    }

    if (priceFilter) {
      const priceNumber = Number(priceFilter)
      if (!Number.isNaN(priceNumber)) {
        result = result.filter(b => b.rango_precios === priceNumber)
      }
    }

    if (tiposFilter.length > 0) {
      result = result.filter(
        b => b.tipo_comida && tiposFilter.includes(b.tipo_comida)
      )
    }

    // Orden: destacados primero, luego por estrellas y nombre
    result.sort((a, b) => {
      if (a.es_destacado && !b.es_destacado) return -1
      if (!a.es_destacado && b.es_destacado) return 1

      const ea = a.estrellas || 0
      const eb = b.estrellas || 0
      if (eb !== ea) return eb - ea

      return a.nombre.localeCompare(b.nombre)
    })

    return result
  }, [bars, search, zonaFilter, priceFilter, tiposFilter])

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [search, zonaFilter, priceFilter, tiposFilter])

  const totalPages = Math.max(1, Math.ceil(filteredBars.length / PAGE_SIZE))

  const paginatedBars = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredBars.slice(start, start + PAGE_SIZE)
  }, [filteredBars, currentPage])

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
        <div className='max-w-6xl mx-auto flex items-center justify-between px-4 py-3'>
          <div>
            <h1 className='text-lg font-semibold'>Bares</h1>
            <p className='text-xs text-slate-400'>
              Descubrí bares y coctelerías recomendadas.
            </p>
          </div>
          <UserDropdown />
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 pt-4 pb-6 space-y-4'>
        {/* Filtros colapsables */}
        <section className='rounded-2xl border border-slate-800 bg-slate-900/40 p-3 space-y-3'>
          <button
            type='button'
            onClick={() => setFiltersOpen(open => !open)}
            className='w-full flex items-center justify-between gap-2 text-sm font-semibold text-slate-100'
          >
            <span className='flex items-center gap-2'>
              <SlidersHorizontal size={14} />
              <span>Filtros</span>
            </span>
            <span className='flex items-center gap-1 text-[11px] text-emerald-400'>
              {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  filtersOpen ? 'rotate-180' : ''
                }`}
              />
            </span>
          </button>

          {filtersOpen && (
            <>
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
            </>
          )}
        </section>

        {/* Estado de carga / error */}
        {loading && <p className='text-xs text-slate-400'>Cargando bares...</p>}

        {error && <p className='text-xs text-red-400'>{error}</p>}

        {/* Listado */}
        {!loading && !error && filteredBars.length === 0 && (
          <p className='text-xs text-slate-400'>
            No se encontraron bares con los filtros actuales.
          </p>
        )}

        {!loading && !error && filteredBars.length > 0 && (
          <>
            <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {paginatedBars.map(place => (
                <div
                  key={place.id}
                  className='rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden'
                >
                  <div className='relative w-full h-36 sm:h-40 md:h-44 bg-slate-800'>
                    <Image
                      alt={place.nombre}
                      src={
                        place.url_imagen ||
                        place.imagen_principal ||
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
                      <span className='mt-1 inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300'>
                        {place.tipo_comida}
                      </span>
                    )}

                    {place.direccion && (
                      <p className='mt-1 text-[10px] text-slate-500 line-clamp-1'>
                        {place.direccion}
                      </p>
                    )}

                    <div className='mt-2 flex justify-end'>
                      <button
                        type='button'
                        onClick={() => openModalFromCard(place)}
                        className='rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors'
                      >
                        Más info
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className='flex items-center justify-center gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className='px-3 py-1.5 rounded-full border border-slate-700 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/70'
                >
                  Anterior
                </button>
                <span className='text-[11px] text-slate-400'>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  type='button'
                  onClick={() =>
                    setCurrentPage(p => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className='px-3 py-1.5 rounded-full border border-slate-700 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/70'
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {/* MODAL detalle */}
        {isModalOpen && selectedBar && (
          <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4'>
            <div className='relative mt-10 mb-24 w-full max-w-lg max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 shadow-xl'>
              <button
                type='button'
                onClick={closeModal}
                className='sticky top-3 ml-auto mr-3 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700'
              >
                ✕
              </button>

              <div className='px-4 pb-4 pt-1 sm:p-6 space-y-4'>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <div className='relative w-full sm:w-40 h-32 sm:h-40 rounded-xl overflow-hidden bg-slate-800'>
                    <Image
                      alt={selectedBar.nombre}
                      src={
                        selectedBar.url_imagen ||
                        selectedBar.imagen_principal ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 100vw, 160px'
                    />
                  </div>

                  <div className='flex-1 space-y-1'>
                    <p className='text-[11px] uppercase font-semibold text-emerald-400'>
                      {selectedBar.zona || 'Zona no especificada'}
                    </p>
                    <h3 className='text-lg font-semibold'>
                      {selectedBar.nombre}
                    </h3>
                    <div className='flex flex-wrap items-center gap-2 text-[12px]'>
                      <span className='text-amber-400'>
                        {renderStars(selectedBar.estrellas)}
                      </span>
                      <span className='text-slate-400'>
                        {renderPriceRange(selectedBar.rango_precios)}
                      </span>
                      {selectedBar.tipo_comida && (
                        <span className='rounded-full border border-slate-700 px-2 py-[2px] text-[11px] text-slate-300'>
                          {selectedBar.tipo_comida}
                        </span>
                      )}
                      {selectedBar.tiene_terraza && (
                        <span className='rounded-full border border-emerald-500/50 px-2 py-[2px] text-[10px] text-emerald-300'>
                          Terraza
                        </span>
                      )}
                      {selectedBar.tiene_musica_vivo && (
                        <span className='rounded-full border border-emerald-500/50 px-2 py-[2px] text-[10px] text-emerald-300'>
                          Música en vivo
                        </span>
                      )}
                      {selectedBar.tiene_happy_hour && (
                        <span className='rounded-full border border-emerald-500/50 px-2 py-[2px] text-[10px] text-emerald-300'>
                          Happy hour
                        </span>
                      )}
                    </div>

                    {selectedBar.instagram && (
                      <a
                        href={selectedBar.instagram}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1'
                      >
                        <Instagram size={14} />
                        <span>
                          @{getInstagramHandle(selectedBar.instagram)}
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                {selectedBar.resena && (
                  <div className='space-y-1'>
                    <h4 className='text-sm font-semibold'>Reseña</h4>
                    <p className='text-[12px] text-slate-300 whitespace-pre-line'>
                      {selectedBar.resena}
                    </p>
                  </div>
                )}

                <div className='grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]'>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Dirección
                    </p>
                    <p className='text-slate-400'>
                      {selectedBar.direccion || '-'}
                    </p>
                    {selectedBar.url_maps && (
                      <a
                        href={selectedBar.url_maps}
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
                      {selectedBar.horario_text || '-'}
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Sitio web
                    </p>
                    {selectedBar.sitio_web ? (
                      <a
                        href={selectedBar.sitio_web}
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                      >
                        {selectedBar.sitio_web}
                      </a>
                    ) : (
                      <p className='text-slate-400'>-</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Reservas
                    </p>
                    {selectedBar.url_reserva ? (
                      <a
                        href={selectedBar.url_reserva}
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
