// C:\Users\sacastro\Documents\proyects\arenaapp\arenaapp-front\src\app\(private)\bares\page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import {
  Instagram,
  SlidersHorizontal,
  ChevronDown,
  Heart,
  HeartOff,
  Loader2,
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'
import { useLocale } from '@/context/LocaleContext'

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

const PUBLIC_ENDPOINT = `${API_BASE}/api/admin/bares/public`
const FAVORITOS_BARES_ENDPOINT = `${API_BASE}/api/admin/favoritos/bares`
const PAGE_SIZE = 12

const BARES_TEXTS = {
  es: {
    pageTitle: 'Bares',
    pageSubtitle: 'Descubrí bares y coctelerías recomendadas.',
    loadingPage: 'Cargando...',
    loadingList: 'Cargando bares...',
    errorDefault: 'Error al cargar bares.',
    emptyList: 'No se encontraron bares con los filtros actuales.',
    filters: {
      title: 'Filtros',
      show: 'Mostrar filtros',
      hide: 'Ocultar filtros',
      searchLabel: 'Buscar',
      searchPlaceholder: 'Nombre, zona, ciudad...',
      zoneLabel: 'Zona',
      zoneAll: 'Todas',
      priceLabel: 'Rango de precios',
      priceAll: 'Todos',
      typeLabel: 'Tipo de comida',
    },
    chips: {
      terrace: 'Terraza',
      liveMusic: 'Música en vivo',
      happyHour: 'Happy hour',
    },
    zoneFallback: 'Zona no especificada',
    pagination: {
      prev: 'Anterior',
      next: 'Siguiente',
      page: 'Página',
      of: 'de',
    },
    modal: {
      review: 'Reseña',
      address: 'Dirección',
      howToGet: 'Cómo llegar',
      schedule: 'Horario',
      website: 'Sitio web',
      reservations: 'Reservas',
      reservationsCta: 'Hacer reserva',
      close: 'Cerrar',
      noData: '-',
    },
    favorite: {
      add: 'Guardar como favorito',
      remove: 'Quitar de favoritos',
    },
  },
  en: {
    pageTitle: 'Bars',
    pageSubtitle: 'Discover recommended bars and cocktail spots.',
    loadingPage: 'Loading...',
    loadingList: 'Loading bars...',
    errorDefault: 'Error loading bars.',
    emptyList: 'No bars found with the current filters.',
    filters: {
      title: 'Filters',
      show: 'Show filters',
      hide: 'Hide filters',
      searchLabel: 'Search',
      searchPlaceholder: 'Name, area, city...',
      zoneLabel: 'Area',
      zoneAll: 'All',
      priceLabel: 'Price range',
      priceAll: 'All',
      typeLabel: 'Cuisine type',
    },
    chips: {
      terrace: 'Terrace',
      liveMusic: 'Live music',
      happyHour: 'Happy hour',
    },
    zoneFallback: 'Area not specified',
    pagination: {
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
    },
    modal: {
      review: 'Review',
      address: 'Address',
      howToGet: 'How to get there',
      schedule: 'Opening hours',
      website: 'Website',
      reservations: 'Bookings',
      reservationsCta: 'Book a table',
      close: 'Close',
      noData: '-',
    },
    favorite: {
      add: 'Save as favorite',
      remove: 'Remove from favorites',
    },
  },
  pt: {
    pageTitle: 'Bares',
    pageSubtitle: 'Descubra bares e coquetelarias recomendadas.',
    loadingPage: 'Carregando...',
    loadingList: 'Carregando bares...',
    errorDefault: 'Erro ao carregar bares.',
    emptyList: 'Nenhum bar encontrado com os filtros atuais.',
    filters: {
      title: 'Filtros',
      show: 'Mostrar filtros',
      hide: 'Ocultar filtros',
      searchLabel: 'Buscar',
      searchPlaceholder: 'Nome, zona, cidade...',
      zoneLabel: 'Zona',
      zoneAll: 'Todas',
      priceLabel: 'Faixa de preço',
      priceAll: 'Todos',
      typeLabel: 'Tipo de comida',
    },
    chips: {
      terrace: 'Terraço',
      liveMusic: 'Música ao vivo',
      happyHour: 'Happy hour',
    },
    zoneFallback: 'Zona não especificada',
    pagination: {
      prev: 'Anterior',
      next: 'Próxima',
      page: 'Página',
      of: 'de',
    },
    modal: {
      review: 'Resenha',
      address: 'Endereço',
      howToGet: 'Como chegar',
      schedule: 'Horário',
      website: 'Site',
      reservations: 'Reservas',
      reservationsCta: 'Fazer reserva',
      close: 'Fechar',
      noData: '-',
    },
    favorite: {
      add: 'Salvar como favorito',
      remove: 'Remover dos favoritos',
    },
  },
} as const

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
  const isLoggedIn = !isLoading && !!user

  const { locale } = useLocale()
  const t = BARES_TEXTS[locale as keyof typeof BARES_TEXTS] ?? BARES_TEXTS.es
  const apiLang: 'es' | 'en' | 'pt' =
    locale === 'en' ? 'en' : locale === 'pt' ? 'pt' : 'es'

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

  // Favoritos de Bares
  const [favoriteBarIds, setFavoriteBarIds] = useState<Set<number>>(new Set())
  const [favoriteLoading, setFavoriteLoading] = useState(false)

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

        const res = await fetch(`${PUBLIC_ENDPOINT}?lang=${apiLang}`, {
          method: 'GET',
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Bar[] = await res.json()
        setBars(data)
      } catch (err: any) {
        console.error('Error cargando bares públicos', err)
        setError(err.message ?? BARES_TEXTS.es.errorDefault)
      } finally {
        setLoading(false)
      }
    }

    fetchBars()
  }, [user, apiLang])

  // 3) Traer favoritos de bares del usuario
  useEffect(() => {
    if (!user) return

    const fetchFavoritos = async () => {
      try {
        const res = await fetch(FAVORITOS_BARES_ENDPOINT, {
          method: 'GET',
          credentials: 'include',
        })

        if (!res.ok) {
          console.error('Error HTTP favoritos bares', res.status)
          return
        }

        const data: any[] = await res.json()

        const ids = data
          .map(row => Number(row.bar_id ?? row.id ?? row.item_id))
          .filter(id => !Number.isNaN(id))

        setFavoriteBarIds(new Set(ids))
      } catch (err) {
        console.error('Error cargando favoritos de bares', err)
      }
    }

    fetchFavoritos()
  }, [user, apiLang])

  // 4) Abrir modal si viene ?barId=
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

  // 5) Toggle favorito de Bar
  const handleToggleFavoriteBar = async (bar: Bar) => {
    if (!bar?.id) return

    const barIdNumeric = Number(bar.id)
    if (!barIdNumeric || Number.isNaN(barIdNumeric)) return

    setFavoriteLoading(true)

    try {
      const isFavorite = favoriteBarIds.has(barIdNumeric)

      const res = await fetch(FAVORITOS_BARES_ENDPOINT, {
        method: isFavorite ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barId: barIdNumeric }),
      })

      if (!res.ok) {
        console.error('Error al actualizar favorito de bar', await res.text())
        return
      }

      setFavoriteBarIds(prev => {
        const next = new Set(prev)
        if (isFavorite) {
          next.delete(barIdNumeric)
        } else {
          next.add(barIdNumeric)
        }
        return next
      })
    } catch (err) {
      console.error('Error al actualizar favorito de bar', err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  // 6) Opciones dinámicas para filtros
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

  // 7) Aplicar filtros + orden
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

  // Reset página al cambiar filtros
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
        <p className='text-sm text-slate-400'>{t.loadingPage}</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-950 text-slate-100 pb-20'>
      <TopNav isLoggedIn={isLoggedIn} />

      <main className='max-w-6xl mx-auto px-4 pt-4 pb-6 space-y-4'>
        {/* Título */}
        <header className='flex flex-col gap-1 mb-1'>
          <h1 className='text-lg font-semibold'>{t.pageTitle}</h1>
          <p className='text-xs text-slate-400'>{t.pageSubtitle}</p>
        </header>

        {/* Filtros */}
        <section className='rounded-2xl border border-slate-800 bg-slate-900/40 p-3 space-y-3'>
          <button
            type='button'
            onClick={() => setFiltersOpen(open => !open)}
            className='w-full flex items-center justify-between gap-2 text-sm font-semibold text-slate-100'
          >
            <span className='flex items-center gap-2'>
              <SlidersHorizontal size={14} />
              <span>{t.filters.title}</span>
            </span>
            <span className='flex items-center gap-1 text-[11px] text-emerald-400'>
              {filtersOpen ? t.filters.hide : t.filters.show}
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
                    {t.filters.searchLabel}
                  </label>
                  <input
                    type='text'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t.filters.searchPlaceholder}
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  />
                </div>

                {/* Zona */}
                <div>
                  <label className='block text-[11px] font-medium text-slate-300 mb-1'>
                    {t.filters.zoneLabel}
                  </label>
                  <select
                    value={zonaFilter}
                    onChange={e => setZonaFilter(e.target.value)}
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  >
                    <option value=''>{t.filters.zoneAll}</option>
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
                    {t.filters.priceLabel}
                  </label>
                  <select
                    value={priceFilter}
                    onChange={e => setPriceFilter(e.target.value)}
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  >
                    <option value=''>{t.filters.priceAll}</option>
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
                    {t.filters.typeLabel}
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

        {/* Estado */}
        {loading && <p className='text-xs text-slate-400'>{t.loadingList}</p>}

        {error && <p className='text-xs text-red-400'>{error}</p>}

        {/* Listado */}
        {!loading && !error && filteredBars.length === 0 && (
          <p className='text-xs text-slate-400'>{t.emptyList}</p>
        )}

        {!loading && !error && filteredBars.length > 0 && (
          <>
            <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {paginatedBars.map(place => (
                <div
                  key={place.id}
                  className='rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden'
                >
                  <div
                    className='relative w-full h-36 sm:h-40 md:h-44 bg-slate-800 cursor-pointer'
                    onClick={() => openModalFromCard(place)}
                  >
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
                      {place.zona || t.zoneFallback}
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
                      {typeof place.estrellas === 'number' && place.estrellas > 0 && (
                        <span className='inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300'>
                          {place.estrellas}★
                        </span>
                      )}
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

                    <div className='mt-2 flex justify-end'>
                      <button
                        type='button'
                        onClick={() => openModalFromCard(place)}
                        className='rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors'
                      >
                        {locale === 'en'
                          ? 'More info'
                          : locale === 'pt'
                          ? 'Ver mais'
                          : 'Más info'}
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
                  {t.pagination.prev}
                </button>
                <span className='text-[11px] text-slate-400'>
                  {t.pagination.page} {currentPage} {t.pagination.of}{' '}
                  {totalPages}
                </span>
                <button
                  type='button'
                  onClick={() =>
                    setCurrentPage(p => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className='px-3 py-1.5 rounded-full border border-slate-700 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/70'
                >
                  {t.pagination.next}
                </button>
              </div>
            )}
          </>
        )}

        {/* MODAL detalle */}
        {isModalOpen && selectedBar && (
          <div
            className='fixed inset-0 z-60 flex items-start justify-center bg-black/60 px-4'
            onClick={closeModal}
          >
            <div
              className='relative mt-10 mb-6 w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 shadow-xl'
              onClick={e => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                type='button'
                onClick={closeModal}
                className='absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 border border-slate-700 text-sm text-slate-200 hover:bg-slate-800 transition'
              >
                ✕
              </button>

              <div className='px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-10 space-y-4'>
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
                      {selectedBar.zona || t.zoneFallback}
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
                        <span className='rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300'>
                          {selectedBar.tipo_comida}
                        </span>
                      )}
                      {selectedBar.tiene_terraza && (
                        <span className='rounded-full border border-emerald-500/50 px-2 py-0.5 text-[10px] text-emerald-300'>
                          {t.chips.terrace}
                        </span>
                      )}
                      {selectedBar.tiene_musica_vivo && (
                        <span className='rounded-full border border-emerald-500/50 px-2 py-0.5 text-[10px] text-emerald-300'>
                          {t.chips.liveMusic}
                        </span>
                      )}
                      {selectedBar.tiene_happy_hour && (
                        <span className='rounded-full border border-emerald-500/50 px-2 py-0.5 text-[10px] text-emerald-300'>
                          {t.chips.happyHour}
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
                    <h4 className='text-sm font-semibold'>{t.modal.review}</h4>
                    <p className='text-[12px] text-slate-300 whitespace-pre-line text-justify md:text-left'>
                      {selectedBar.resena}
                    </p>
                  </div>
                )}

                <div className='grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]'>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      {t.modal.address}
                    </p>
                    <p className='text-slate-400'>
                      {selectedBar.direccion || t.modal.noData}
                    </p>
                    {selectedBar.url_maps && (
                      <a
                        href={selectedBar.url_maps}
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 mt-1 inline-block'
                      >
                        {t.modal.howToGet}
                      </a>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      {t.modal.schedule}
                    </p>
                    <p className='text-slate-400'>
                      {selectedBar.horario_text || t.modal.noData}
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      {t.modal.website}
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
                      <p className='text-slate-400'>{t.modal.noData}</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      {t.modal.reservations}
                    </p>
                    {selectedBar.url_reserva ? (
                      <a
                        href={selectedBar.url_reserva}
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                      >
                        {t.modal.reservationsCta}
                      </a>
                    ) : (
                      <p className='text-slate-400'>{t.modal.noData}</p>
                    )}
                  </div>
                </div>

                {/* Botones cierre + favorito */}
                <div className='flex flex-col sm:flex-row sm:justify-end gap-2 pt-2'>
                  {/* BOTÓN CERRAR */}
                  <button
                    type='button'
                    onClick={closeModal}
                    className='w-full max-w-[200px] self-center sm:self-auto
               rounded-full border border-slate-700 
               px-3 py-1.5 text-[11px] font-medium text-slate-300 
               hover:bg-slate-800 transition'
                  >
                    {t.modal.close}
                  </button>

                  {/* BOTÓN FAVORITO */}
                  {(() => {
                    const isFavorite = favoriteBarIds.has(
                      Number(selectedBar.id)
                    )
                    const label = isFavorite
                      ? t.favorite.remove
                      : t.favorite.add

                    return (
                      <button
                        type='button'
                        disabled={favoriteLoading}
                        onClick={() => handleToggleFavoriteBar(selectedBar)}
                        className={`w-full max-w-[230px] self-center sm:self-auto
          inline-flex items-center justify-center gap-6
          rounded-full px-3 py-1.5 text-[11px] font-semibold transition
          ${
            isFavorite
              ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
              : 'bg-slate-900 text-slate-100 border border-slate-700 hover:border-emerald-400 hover:bg-slate-800'
          }
          ${favoriteLoading ? 'opacity-60 cursor-wait' : ''}
        `}
                      >
                        {favoriteLoading ? (
                          <Loader2 size={14} className='animate-spin' />
                        ) : isFavorite ? (
                          <HeartOff size={14} />
                        ) : (
                          <Heart size={14} className='fill-emerald-500/70' />
                        )}
                        <span>{label}</span>
                      </button>
                    )
                  })()}
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
