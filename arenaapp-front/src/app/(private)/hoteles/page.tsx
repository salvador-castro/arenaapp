// C:\Users\sacastro\Documents\proyects\arenaapp\arenaapp-front\src\app\(private)\hoteles\page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import Image from 'next/image'
import { Instagram, SlidersHorizontal, ChevronDown, MapPin } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'

interface Hotel {
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
  lat: number | null
  lng: number | null
  telefono: string | null
  email_contacto: string | null
  sitio_web: string | null
  instagram: string | null
  facebook: string | null
  estrellas: number | null
  checkin_desde: string | null
  checkout_hasta: string | null
  precio_noche_desde: number | null
  rango_precio: number | null
  moneda: string | null
  es_destacado: boolean
  imagen_principal: string | null
  url_imagen: string | null
  url_maps: string | null
  url_reservas: string | null
  horario_text: string | null
  meta_title: string | null
  meta_description: string | null
  resena: string | null
  estado: string
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const PUBLIC_ENDPOINT = `${API_BASE}/api/admin/hoteles/public`
const FAVORITOS_HOTELES_ENDPOINT = `${API_BASE}/api/admin/favoritos/hoteles`
const PAGE_SIZE = 12

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

function renderStars (estrellas: number | null | undefined): string {
  if (!estrellas || estrellas < 1) return '-'
  const value = Math.min(Math.max(estrellas, 1), 5)
  return '★'.repeat(value)
}

/* ---------------- i18n simple (es, en, pt) ---------------- */

const HOTELES_TEXTS = {
  es: {
    pageTitle: 'Hoteles',
    pageSubtitle: 'Encontrá hoteles y alojamientos para tu estadía.',
    loadingPage: 'Cargando...',
    loadingList: 'Cargando hoteles...',
    errorDefault: 'Error al cargar hoteles.',
    emptyList: 'No se encontraron hoteles con los filtros actuales.',
    filters: {
      title: 'Filtros',
      show: 'Mostrar filtros',
      hide: 'Ocultar filtros',
      searchLabel: 'Buscar',
      searchPlaceholder: 'Nombre, ciudad, provincia...',
      zoneLabel: 'Zona',
      zoneAll: 'Todas',
      starsLabel: 'Estrellas',
      starsAll: 'Todas',
    },
    locationFallback: 'Ubicación no especificada',
    pagination: {
      prev: 'Anterior',
      next: 'Siguiente',
      page: 'Página',
      of: 'de',
    },
    card: {
      moreInfo: 'Más info',
    },
    modal: {
      review: 'Reseña',
      address: 'Dirección',
      checkinCheckout: 'Check-in / Check-out',
      website: 'Sitio web',
      contact: 'Contacto',
      priceFromNightPrefix: 'Desde',
      pricePerNight: '/ noche',
      close: 'Cerrar',
      noData: '-',
    },
    favorite: {
      add: 'Guardar como favorito',
      remove: 'Quitar de favoritos',
    },
  },
  en: {
    pageTitle: 'Hotels',
    pageSubtitle: 'Find hotels and accommodation for your stay.',
    loadingPage: 'Loading...',
    loadingList: 'Loading hotels...',
    errorDefault: 'Error loading hotels.',
    emptyList: 'No hotels found with the current filters.',
    filters: {
      title: 'Filters',
      show: 'Show filters',
      hide: 'Hide filters',
      searchLabel: 'Search',
      searchPlaceholder: 'Name, city, state...',
      zoneLabel: 'Area',
      zoneAll: 'All',
      starsLabel: 'Stars',
      starsAll: 'All',
    },
    locationFallback: 'Location not specified',
    pagination: {
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
    },
    card: {
      moreInfo: 'More info',
    },
    modal: {
      review: 'Review',
      address: 'Address',
      checkinCheckout: 'Check-in / Check-out',
      website: 'Website',
      contact: 'Contact',
      priceFromNightPrefix: 'From',
      pricePerNight: '/ night',
      close: 'Close',
      noData: '-',
    },
    favorite: {
      add: 'Save as favorite',
      remove: 'Remove from favorites',
    },
  },
  pt: {
    pageTitle: 'Hotéis',
    pageSubtitle: 'Encontre hotéis e hospedagens para a sua estadia.',
    loadingPage: 'Carregando...',
    loadingList: 'Carregando hotéis...',
    errorDefault: 'Erro ao carregar hotéis.',
    emptyList: 'Nenhum hotel encontrado com os filtros atuais.',
    filters: {
      title: 'Filtros',
      show: 'Mostrar filtros',
      hide: 'Ocultar filtros',
      searchLabel: 'Buscar',
      searchPlaceholder: 'Nome, cidade, estado...',
      zoneLabel: 'Zona',
      zoneAll: 'Todas',
      starsLabel: 'Estrelas',
      starsAll: 'Todas',
    },
    locationFallback: 'Localização não especificada',
    pagination: {
      prev: 'Anterior',
      next: 'Próxima',
      page: 'Página',
      of: 'de',
    },
    card: {
      moreInfo: 'Ver mais',
    },
    modal: {
      review: 'Resenha',
      address: 'Endereço',
      checkinCheckout: 'Check-in / Check-out',
      website: 'Site',
      contact: 'Contato',
      priceFromNightPrefix: 'Desde',
      pricePerNight: '/ noite',
      close: 'Fechar',
      noData: '-',
    },
    favorite: {
      add: 'Salvar como favorito',
      remove: 'Remover dos favoritos',
    },
  },
} as const

type Lang = keyof typeof HOTELES_TEXTS

/* ---------------------------------------------------------- */

export default function HotelesPage () {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

  const { locale } = useLocale()
  const currentLang: Lang =
    locale === 'en' || locale === 'pt' || locale === 'es' ? locale : 'es'
  const t = HOTELES_TEXTS[currentLang]

  const hotelIdParam = searchParams.get('hotelId')
  const hotelId = hotelIdParam ? Number(hotelIdParam) : null

  const [hoteles, setHoteles] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtros
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [estrellasFilter, setEstrellasFilter] = useState('')

  const [currentPage, setCurrentPage] = useState(1)

  // Favoritos
  const [favoriteHotelIds, setFavoriteHotelIds] = useState<Set<number>>(
    new Set()
  )
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // Guardia de auth
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const redirectUrl = hotelId ? `/hoteles?hotelId=${hotelId}` : '/hoteles'
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }
  }, [user, isLoading, router, hotelId])

  // Traer hoteles PUBLICADOS
  useEffect(() => {
    if (!user) return

    const fetchHoteles = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(PUBLIC_ENDPOINT, {
          method: 'GET',
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Hotel[] = await res.json()
        setHoteles(data)
      } catch (err: any) {
        console.error('Error cargando hoteles públicos', err)
        setError(err.message ?? HOTELES_TEXTS.es.errorDefault)
      } finally {
        setLoading(false)
      }
    }

    fetchHoteles()
  }, [user])

  // Traer hoteles favoritos del usuario
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        const headers: HeadersInit = {}
        if (auth?.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }

        const res = await fetch(FAVORITOS_HOTELES_ENDPOINT, {
          method: 'GET',
          headers,
          credentials: 'include',
        })

        if (!res.ok) {
          console.error('Error cargando favoritos de hoteles', await res.text())
          return
        }

        const data: any[] = await res.json()
        const ids = data
          .map(row => Number(row.hotel_id))
          .filter(id => !Number.isNaN(id))

        setFavoriteHotelIds(new Set(ids))
      } catch (err) {
        console.error('Error cargando favoritos de hoteles', err)
      }
    }

    fetchFavorites()
  }, [user, auth?.token])

  // Toggle favorito hotel
  const handleToggleFavorite = async (hotel: Hotel) => {
    if (!hotel?.id) return

    const hotelIdNum = Number(hotel.id)
    if (!hotelIdNum || Number.isNaN(hotelIdNum)) return

    setFavoriteLoading(true)

    try {
      const isFavorite = favoriteHotelIds.has(hotelIdNum)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (auth?.token) {
        headers['Authorization'] = `Bearer ${auth.token}`
      }

      const res = await fetch(FAVORITOS_HOTELES_ENDPOINT, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ hotelId: hotelIdNum }),
      })

      if (!res.ok) {
        console.error('Error al actualizar favorito de hotel', await res.text())
        return
      }

      setFavoriteHotelIds(prev => {
        const next = new Set(prev)
        if (isFavorite) {
          next.delete(hotelIdNum)
        } else {
          next.add(hotelIdNum)
        }
        return next
      })
    } catch (err) {
      console.error('Error al actualizar favorito de hotel', err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  // Si venimos con ?hotelId=, abrir modal cuando haya data
  useEffect(() => {
    if (!hoteles.length) return
    if (!hotelId) return

    const found = hoteles.find(h => Number(h.id) === Number(hotelId))

    if (found) {
      setSelectedHotel(found)
      setIsModalOpen(true)
    }
  }, [hoteles, hotelId])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedHotel(null)
    router.push('/hoteles')
  }

  const openModalFromCard = (hotel: Hotel) => {
    setSelectedHotel(hotel)
    setIsModalOpen(true)
    router.push(`/hoteles?hotelId=${hotel.id}`)
  }

  // Opciones dinámicas para filtros
  const zonas = useMemo(
    () =>
      Array.from(
        new Set(
          hoteles
            .map(h => h.zona)
            .filter((z): z is string => !!z && z.trim().length > 0)
        )
      ).sort(),
    [hoteles]
  )

  const estrellasOptions = useMemo(
    () =>
      Array.from(
        new Set(
          hoteles
            .map(h => h.estrellas)
            .filter(
              (e): e is number =>
                typeof e === 'number' && !Number.isNaN(e) && e > 0
            )
        )
      ).sort((a, b) => a - b),
    [hoteles]
  )

  // Aplicar filtros
  const filteredHoteles = useMemo(() => {
    let result = [...hoteles]

    const term = normalizeText(search.trim())
    if (term) {
      result = result.filter(h => {
        const nombre = normalizeText(h.nombre)
        const ciudad = normalizeText(h.ciudad)
        const provincia = normalizeText(h.provincia)
        const zona = normalizeText(h.zona)
        return (
          nombre.includes(term) ||
          ciudad.includes(term) ||
          provincia.includes(term) ||
          zona.includes(term)
        )
      })
    }

    if (zonaFilter) {
      result = result.filter(h => h.zona === zonaFilter)
    }

    if (estrellasFilter) {
      const target = Number(estrellasFilter)
      result = result.filter(h => Number(h.estrellas) === target)
    }

    // Primero destacados, luego por nombre
    result.sort((a, b) => {
      if (a.es_destacado && !b.es_destacado) return -1
      if (!a.es_destacado && b.es_destacado) return 1
      return a.nombre.localeCompare(b.nombre)
    })

    return result
  }, [hoteles, search, zonaFilter, estrellasFilter])

  // reset paginación al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [search, zonaFilter, estrellasFilter])

  const totalPages = Math.max(1, Math.ceil(filteredHoteles.length / PAGE_SIZE))

  const paginatedHoteles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredHoteles.slice(start, start + PAGE_SIZE)
  }, [filteredHoteles, currentPage])

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

        {/* Filtros colapsables */}
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
                <div>
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

                {/* Estrellas */}
                <div>
                  <label className='block text-[11px] font-medium text-slate-300 mb-1'>
                    {t.filters.starsLabel}
                  </label>
                  <select
                    value={estrellasFilter}
                    onChange={e => setEstrellasFilter(e.target.value)}
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  >
                    <option value=''>{t.filters.starsAll}</option>
                    {estrellasOptions.map(e => (
                      <option key={e} value={e}>
                        {e}{' '}
                        {currentLang === 'en'
                          ? 'star'
                          : currentLang === 'pt'
                          ? 'estrela'
                          : 'estrella'}
                        {e > 1 &&
                          (currentLang === 'en'
                            ? 's'
                            : currentLang === 'pt'
                            ? 's'
                            : 's')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Estado de carga / error */}
        {loading && <p className='text-xs text-slate-400'>{t.loadingList}</p>}

        {error && <p className='text-xs text-red-400'>{error}</p>}

        {/* Listado */}
        {!loading && !error && filteredHoteles.length === 0 && (
          <p className='text-xs text-slate-400'>{t.emptyList}</p>
        )}

        {!loading && !error && filteredHoteles.length > 0 && (
          <>
            <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {paginatedHoteles.map(hotel => (
                <div
                  key={hotel.id}
                  className='rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden'
                >
                  <div className='relative w-full h-36 sm:h-40 md:h-44 bg-slate-800'>
                    <Image
                      alt={hotel.nombre}
                      src={
                        hotel.url_imagen ||
                        hotel.imagen_principal ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className='object-cover'
                      sizes='(max-width: 768px) 100vw, 25vw'
                    />
                  </div>

                  <div className='p-3 flex-1 flex flex-col gap-1 text-[11px]'>
                    <p className='text-[10px] uppercase font-semibold text-emerald-400'>
                      {hotel.zona ||
                        hotel.ciudad ||
                        hotel.provincia ||
                        t.locationFallback}
                    </p>

                    <h3 className='text-sm font-semibold line-clamp-1'>
                      {hotel.nombre}
                    </h3>

                    {hotel.descripcion_corta && (
                      <p className='text-slate-400 line-clamp-2'>
                        {hotel.descripcion_corta}
                      </p>
                    )}

                    {hotel.direccion && (
                      <p className='mt-1 text-[10px] text-slate-500 line-clamp-1 flex items-center gap-1'>
                        <MapPin size={11} className='shrink-0' />
                        {hotel.direccion}
                      </p>
                    )}

                    <div className='mt-1 flex flex-wrap gap-2 text-[10px] text-slate-300'>
                      {typeof hotel.estrellas === 'number' &&
                        hotel.estrellas > 0 && (
                          <span className='inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300'>
                            {hotel.estrellas}★
                          </span>
                        )}
                      {typeof hotel.precio_noche_desde === 'number' &&
                        hotel.precio_noche_desde > 0 && (
                          <span className='inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300'>
                            {t.modal.priceFromNightPrefix}{' '}
                            {hotel.precio_noche_desde} {hotel.moneda || 'ARS'}{' '}
                            {t.modal.pricePerNight}
                          </span>
                        )}
                    </div>

                    <div className='mt-2 flex justify-end'>
                      <button
                        type='button'
                        onClick={() => openModalFromCard(hotel)}
                        className='rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors'
                      >
                        {t.card.moreInfo}
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
        {isModalOpen && selectedHotel && (
          <div
            className='fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4'
            onClick={closeModal}
          >
            <div
              className='relative mt-10 mb-24 w-full max-w-lg max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 shadow-xl'
              onClick={e => e.stopPropagation()}
            >
              <button
                type='button'
                onClick={closeModal}
                className='absolute top-3 right-3 z-20
                   flex h-8 w-8 items-center justify-center
                   rounded-full bg-slate-900/80 border border-slate-700
                   text-sm text-slate-200 hover:bg-slate-800 transition'
              >
                ✕
              </button>

              <div className='px-4 pb-4 pt-1 sm:p-6 space-y-4'>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <div className='relative w-full sm:w-40 h-32 sm:h-40 rounded-xl overflow-hidden bg-slate-800'>
                    <Image
                      alt={selectedHotel.nombre}
                      src={
                        selectedHotel.url_imagen ||
                        selectedHotel.imagen_principal ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 100vw, 160px'
                    />
                  </div>

                  <div className='flex-1 space-y-1'>
                    <p className='text-[11px] uppercase font-semibold text-emerald-400'>
                      {selectedHotel.zona ||
                        selectedHotel.ciudad ||
                        selectedHotel.provincia ||
                        t.locationFallback}
                    </p>
                    <h3 className='text-lg font-semibold'>
                      {selectedHotel.nombre}
                    </h3>

                    {selectedHotel.instagram && (
                      <a
                        href={selectedHotel.instagram}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1'
                      >
                        <Instagram size={14} />
                        <span>
                          @{getInstagramHandle(selectedHotel.instagram)}
                        </span>
                      </a>
                    )}

                    <div className='flex flex-wrap items-center gap-2 mt-2 text-[12px]'>
                      {selectedHotel.estrellas && selectedHotel.estrellas > 0 && (
                        <span className='text-amber-400'>
                          {renderStars(selectedHotel.estrellas)}
                        </span>
                      )}
                      {typeof selectedHotel.precio_noche_desde === 'number' &&
                        selectedHotel.precio_noche_desde > 0 && (
                          <span className='inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300'>
                            {t.modal.priceFromNightPrefix}{' '}
                            {selectedHotel.precio_noche_desde}{' '}
                            {selectedHotel.moneda || 'ARS'}{' '}
                            {t.modal.pricePerNight}
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {selectedHotel.resena && (
                  <div className='space-y-1'>
                    <h4 className='text-sm font-semibold'>{t.modal.review}</h4>
                    <p className='text-[12px] text-slate-300 whitespace-pre-line text-justify md:text-left'>
                      {selectedHotel.resena}
                    </p>
                  </div>
                )}

                <div className='grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]'>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      {t.modal.address}
                    </p>
                    <p className='text-slate-400'>
                      {selectedHotel.direccion || t.modal.noData}
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      {t.modal.checkinCheckout}
                    </p>
                    <p className='text-slate-400'>
                      {selectedHotel.checkin_desde ||
                      selectedHotel.checkout_hasta
                        ? `${selectedHotel.checkin_desde ?? ''}${
                            selectedHotel.checkin_desde &&
                            selectedHotel.checkout_hasta
                              ? ' · '
                              : ''
                          }${selectedHotel.checkout_hasta ?? ''}`
                        : t.modal.noData}
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      {t.modal.website}
                    </p>
                    {selectedHotel.sitio_web ? (
                      <a
                        href={selectedHotel.sitio_web}
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                      >
                        {selectedHotel.sitio_web}
                      </a>
                    ) : (
                      <p className='text-slate-400'>{t.modal.noData}</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      {t.modal.contact}
                    </p>
                    <p className='text-slate-400'>
                      {selectedHotel.telefono || selectedHotel.email_contacto
                        ? `${selectedHotel.telefono ?? ''}${
                            selectedHotel.telefono &&
                            selectedHotel.email_contacto
                              ? ' · '
                              : ''
                          }${selectedHotel.email_contacto ?? ''}`
                        : t.modal.noData}
                    </p>
                  </div>
                </div>

                {selectedHotel && (
                  <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-2'>
                    <button
                      type='button'
                      onClick={closeModal}
                      className='rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800'
                    >
                      {t.modal.close}
                    </button>

                    {(() => {
                      const isFavorite = favoriteHotelIds.has(
                        Number(selectedHotel.id)
                      )

                      const label = isFavorite
                        ? t.favorite.remove
                        : t.favorite.add

                      return (
                        <button
                          type='button'
                          disabled={favoriteLoading}
                          onClick={() => handleToggleFavorite(selectedHotel)}
                          className={`rounded-full px-4 py-1.5 text-xs font-medium flex items-center gap-1 transition
                            ${
                              isFavorite
                                ? 'border border-emerald-400 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'border border-slate-700 text-slate-200 hover:border-emerald-400 hover:bg-slate-800'
                            }
                            ${favoriteLoading ? 'opacity-60 cursor-wait' : ''}
                          `}
                        >
                          {label}
                        </button>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
