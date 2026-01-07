'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import {
  SlidersHorizontal,
  ChevronDown,
  Heart,
  HeartOff,
  Loader2,
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'
import { useLocale } from '@/context/LocaleContext'

interface Cafe {
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

const PUBLIC_ENDPOINT = `${API_BASE}/api/admin/cafes/public`
const FAVORITOS_CAFES_ENDPOINT = `${API_BASE}/api/admin/favoritos/cafes`
const PAGE_SIZE = 12

const CAFES_TEXTS = {
  es: {
    pageTitle: 'Cafés',
    pageSubtitle: 'Descubrí cafés de especialidad y meriendas.',
    loadingPage: 'Cargando...',
    loadingList: 'Cargando cafés...',
    errorDefault: 'Error al cargar cafés.',
    emptyList: 'No se encontraron cafés con los filtros actuales.',
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
    pageTitle: 'Cafes',
    pageSubtitle: 'Discover specialty coffee shops and snacks.',
    loadingPage: 'Loading...',
    loadingList: 'Loading cafes...',
    errorDefault: 'Error loading cafes.',
    emptyList: 'No cafes found with the current filters.',
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
    pageTitle: 'Cafés',
    pageSubtitle: 'Descubra cafés especiais e lanches.',
    loadingPage: 'Carregando...',
    loadingList: 'Carregando cafés...',
    errorDefault: 'Erro ao carregar cafés.',
    emptyList: 'Nenhum café encontrado com os filtros atuais.',
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

function normalizeText (value: string | null | undefined): string {
  if (!value) return ''
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function CafesPage () {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

  const { locale } = useLocale()
  const t = CAFES_TEXTS[locale as keyof typeof CAFES_TEXTS] ?? CAFES_TEXTS.es
  const apiLang: 'es' | 'en' | 'pt' =
    locale === 'en' ? 'en' : locale === 'pt' ? 'pt' : 'es'

  const cafeIdParam = searchParams.get('cafeId')
  const cafeId = cafeIdParam ? Number(cafeIdParam) : null

  const [cafes, setCafes] = useState<Cafe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtros
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [tiposFilter, setTiposFilter] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // Favoritos de Cafes
  const [favoriteCafeIds, setFavoriteCafeIds] = useState<Set<number>>(new Set())
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // 1) Guardia de auth
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const redirectUrl = cafeId ? `/cafes?cafeId=${cafeId}` : '/cafes'
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }
  }, [user, isLoading, router, cafeId])

  // 2) Traer todos los cafes PUBLICADOS
  useEffect(() => {
    if (!user) return

    const fetchCafes = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${PUBLIC_ENDPOINT}?lang=${apiLang}`, {
          method: 'GET',
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Cafe[] = await res.json()
        setCafes(data)
      } catch (err: any) {
        console.error('Error cargando cafes públicos', err)
        setError(err.message ?? CAFES_TEXTS.es.errorDefault)
      } finally {
        setLoading(false)
      }
    }

    fetchCafes()
  }, [user, apiLang])

  // 3) Traer favoritos de cafes del usuario
  useEffect(() => {
    if (!user) return

    const fetchFavoritos = async () => {
      try {
        const headers: HeadersInit = {}
        if (auth?.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }

        const res = await fetch(FAVORITOS_CAFES_ENDPOINT, {
          method: 'GET',
          headers,
          credentials: 'include',
        })

        if (!res.ok) {
          console.error('Error HTTP favoritos cafes', res.status)
          return
        }

        const data: any[] = await res.json()

        const ids = data
          .map(row => Number(row.cafe_id ?? row.id ?? row.item_id))
          .filter(id => !Number.isNaN(id))

        setFavoriteCafeIds(new Set(ids))
      } catch (err) {
        console.error('Error cargando favoritos de cafes', err)
      }
    }

    fetchFavoritos()
  }, [user, apiLang, auth?.token])

  // 4) Abrir modal si viene ?cafeId=
  useEffect(() => {
    if (!cafes.length) return
    if (!cafeId) return

    const found = cafes.find(c => Number(c.id) === Number(cafeId))

    if (found) {
      setSelectedCafe(found)
      setIsModalOpen(true)
    }
  }, [cafes, cafeId])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedCafe(null)
    router.push('/cafes')
  }

  const openModalFromCard = (place: Cafe) => {
    setSelectedCafe(place)
    setIsModalOpen(true)
    router.push(`/cafes?cafeId=${place.id}`)
  }

  // 5) Toggle favorito de Cafe
  const handleToggleFavoriteCafe = async (cafe: Cafe) => {
    if (!cafe?.id) return

    const cafeIdNumeric = Number(cafe.id)
    if (!cafeIdNumeric || Number.isNaN(cafeIdNumeric)) return

    setFavoriteLoading(true)

    try {
      const isFavorite = favoriteCafeIds.has(cafeIdNumeric)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (auth?.token) {
        headers['Authorization'] = `Bearer ${auth.token}`
      }

      const res = await fetch(FAVORITOS_CAFES_ENDPOINT, {
        method: isFavorite ? 'DELETE' : 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ cafeId: cafeIdNumeric }),
      })

      if (!res.ok) {
        console.error('Error al actualizar favorito de cafe', await res.text())
        return
      }

      setFavoriteCafeIds(prev => {
        const next = new Set(prev)
        if (isFavorite) {
          next.delete(cafeIdNumeric)
        } else {
          next.add(cafeIdNumeric)
        }
        return next
      })
    } catch (err) {
      console.error('Error al actualizar favorito de cafe', err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  // 6) Opciones dinámicas para filtros
  const zonas = useMemo(
    () =>
      Array.from(
        new Set(
          cafes
            .map(c => c.zona)
            .filter((z): z is string => !!z && z.trim().length > 0)
        )
      ).sort(),
    [cafes]
  )

  const precios = useMemo(
    () =>
      Array.from(
        new Set(
          cafes
            .map(c => c.rango_precios)
            .filter(
              (p): p is number => typeof p === 'number' && !Number.isNaN(p)
            )
        )
      ).sort((a, b) => a - b),
    [cafes]
  )

  const tiposComida = useMemo(
    () =>
      Array.from(
        new Set(
          cafes
            .map(c => c.tipo_comida)
            .filter((t): t is string => !!t && t.trim().length > 0)
        )
      ).sort(),
    [cafes]
  )

  // 7) Aplicar filtros + orden
  const filteredCafes = useMemo(() => {
    let result = [...cafes]

    const term = normalizeText(search.trim())
    if (term) {
      result = result.filter(c => {
        const nombre = normalizeText(c.nombre)
        const tipo = normalizeText(c.tipo_comida)
        const zona = normalizeText(c.zona)
        const ciudad = normalizeText(c.ciudad)
        return (
          nombre.includes(term) ||
          tipo.includes(term) ||
          zona.includes(term) ||
          ciudad.includes(term)
        )
      })
    }

    if (zonaFilter) {
      result = result.filter(c => c.zona === zonaFilter)
    }

    if (priceFilter) {
      const priceNumber = Number(priceFilter)
      if (!Number.isNaN(priceNumber)) {
        result = result.filter(c => c.rango_precios === priceNumber)
      }
    }

    if (tiposFilter.length > 0) {
      result = result.filter(
        c => c.tipo_comida && tiposFilter.includes(c.tipo_comida)
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
  }, [cafes, search, zonaFilter, priceFilter, tiposFilter])

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [search, zonaFilter, priceFilter, tiposFilter])

  const totalPages = Math.max(1, Math.ceil(filteredCafes.length / PAGE_SIZE))

  const paginatedCafes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredCafes.slice(start, start + PAGE_SIZE)
  }, [filteredCafes, currentPage])

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
        {!loading && !error && filteredCafes.length === 0 && (
          <p className='text-xs text-slate-400'>{t.emptyList}</p>
        )}

        {!loading && !error && filteredCafes.length > 0 && (
          <>
            <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {paginatedCafes.map(place => (
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
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleToggleFavoriteCafe(place)
                      }}
                      className='absolute top-2 right-2 z-10 p-1.5 rounded-full bg-slate-900/50 text-slate-100 backdrop-blur-sm transition hover:bg-slate-900/70 hover:scale-105'
                      title={
                        favoriteCafeIds.has(Number(place.id))
                          ? t.favorite.remove
                          : t.favorite.add
                      }
                    >
                      {favoriteCafeIds.has(Number(place.id)) ? (
                        <Heart className='fill-red-500 text-red-500' size={16} />
                      ) : (
                        <Heart className='text-slate-100' size={16} />
                      )}
                    </button>
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
        {isModalOpen && selectedCafe && (
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
                      alt={selectedCafe.nombre}
                      src={
                        selectedCafe.url_imagen ||
                        selectedCafe.imagen_principal ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 100vw, 160px'
                    />
                  </div>

                  <div className='flex-1 space-y-1'>
                    <p className='text-[11px] uppercase font-semibold text-emerald-400'>
                      {selectedCafe.zona || t.zoneFallback}
                    </p>
                    <h2 className='text-lg font-bold leading-tight'>
                      {selectedCafe.nombre}
                    </h2>

                    {selectedCafe.tipo_comida && (
                      <span className='inline-flex rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300'>
                        {selectedCafe.tipo_comida}
                      </span>
                    )}

                    <div className='flex items-center gap-3 pt-1 text-xs text-slate-400'>
                      {typeof selectedCafe.estrellas === 'number' &&
                        selectedCafe.estrellas > 0 && (
                          <span className='text-amber-400 font-medium'>
                            {selectedCafe.estrellas} ★
                          </span>
                        )}
                      <span>
                        {renderPriceRange(selectedCafe.rango_precios)}
                      </span>
                    </div>

                    {/* Chips extra: Terraza, Musica, Happy Hour */}
                     <div className='flex flex-wrap gap-2 pt-1'>
                      {selectedCafe.tiene_terraza && (
                        <span className='rounded-full border border-emerald-500/50 px-2 py-0.5 text-[10px] text-emerald-300'>
                          {t.chips.terrace}
                        </span>
                      )}
                      {selectedCafe.tiene_musica_vivo && (
                        <span className='rounded-full border border-emerald-500/50 px-2 py-0.5 text-[10px] text-emerald-300'>
                          {t.chips.liveMusic}
                        </span>
                      )}
                      {selectedCafe.tiene_happy_hour && (
                        <span className='rounded-full border border-emerald-500/50 px-2 py-0.5 text-[10px] text-emerald-300'>
                          {t.chips.happyHour}
                        </span>
                      )}
                     </div>

                  </div>
                </div>

                <div className='space-y-4 text-sm text-slate-300 pt-2'>
                  {selectedCafe.descripcion_larga && (
                    <div className='bg-slate-900/40 p-3 rounded-xl border border-slate-800/50'>
                      <p className='whitespace-pre-line text-xs leading-relaxed'>
                        {selectedCafe.descripcion_larga}
                      </p>
                    </div>
                  )}

                   {selectedCafe.resena && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{t.modal.review}</h4>
                    <p className="text-[12px] text-slate-300 whitespace-pre-line text-justify md:text-left">
                      {selectedCafe.resena}
                    </p>
                  </div>
                )}
                  {!selectedCafe.descripcion_larga && selectedCafe.descripcion_corta && (
                    <p className='text-xs italic text-slate-400'>
                      {selectedCafe.descripcion_corta}
                    </p>
                  )}

                  {/* Info grid */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'>
                    {selectedCafe.direccion && (
                      <div>
                        <span className='block font-semibold text-slate-500 mb-0.5'>
                          {t.modal.address}
                        </span>
                        <span>{selectedCafe.direccion}</span>
                        {selectedCafe.ciudad && `, ${selectedCafe.ciudad}`}
                      </div>
                    )}

                    {selectedCafe.horario_text && (
                      <div>
                        <span className='block font-semibold text-slate-500 mb-0.5'>
                          {t.modal.schedule}
                        </span>
                        <span>{selectedCafe.horario_text}</span>
                      </div>
                    )}

                    {(selectedCafe.url_maps || selectedCafe.sitio_web || selectedCafe.instagram) && (
                         <div className='sm:col-span-2 flex flex-wrap gap-2 pt-1'>
                            {selectedCafe.url_maps && (
                                <a 
                                  href={selectedCafe.url_maps}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[10px] hover:bg-slate-700'
                                >
                                    🗺️ Maps
                                </a>
                            )}
                             {selectedCafe.instagram && (
                                <a 
                                  href={selectedCafe.instagram}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[10px] hover:bg-slate-700'
                                >
                                    📸 Instagram
                                </a>
                            )}
                            {selectedCafe.sitio_web && (
                                <a 
                                  href={selectedCafe.sitio_web}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[10px] hover:bg-slate-700'
                                >
                                    🔗 Web
                                </a>
                            )}
                         </div>
                    )}
                  </div>

                  {selectedCafe.url_reserva && (
                    <div className='pt-2'>
                        <a 
                          href={selectedCafe.url_reserva}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='block w-full text-center rounded-xl bg-emerald-600 py-2.5 font-bold text-white transition hover:bg-emerald-500 text-xs'
                        >
                            {t.modal.reservationsCta}
                        </a>
                    </div>
                  )}
                  
                  {/* Footer Modal: Close + Favorite */}
                 <div className='flex flex-col sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-800/60 mt-4'>
                    <button
                      type='button'
                      onClick={closeModal}
                      className='w-full max-w-[200px] self-center sm:self-auto rounded-full border border-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-slate-800 transition'
                    >
                      {t.modal.close}
                    </button>

                    {(() => {
                      const isFavorite = favoriteCafeIds.has(Number(selectedCafe.id))
                      const label = isFavorite ? t.favorite.remove : t.favorite.add

                      return (
                        <button
                          type='button'
                          disabled={favoriteLoading}
                          onClick={() => handleToggleFavoriteCafe(selectedCafe)}
                          className={`w-full max-w-[230px] self-center sm:self-auto inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold transition
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
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
