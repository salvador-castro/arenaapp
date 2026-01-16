'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import Image from 'next/image'
import { Instagram, SlidersHorizontal, ChevronDown } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'

interface Restaurant {
  id: number | string
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
const FAVORITOS_RESTAURANTES_ENDPOINT = `${API_BASE}/api/admin/favoritos/restaurantes`
const PAGE_SIZE = 6

const RESTAURANTES_TEXTS = {
  es: {
    pageTitle: 'Ruta Foodie',
    pageSubtitle: 'Explorá los lugares recomendados.',
    loadingPage: 'Cargando...',
    loadingList: 'Cargando restaurantes...',
    errorDefault: 'Error al cargar restaurantes.',
    emptyList: 'No se encontraron restaurantes con los filtros actuales.',
    zoneFallback: 'Zona no especificada',
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
      moreInfo: 'Más info',
    },
    favorite: {
      add: 'Guardar como favorito',
      remove: 'Quitar de favoritos',
    },
  },
  en: {
    pageTitle: 'Foodie Route',
    pageSubtitle: 'Explore recommended places.',
    loadingPage: 'Loading...',
    loadingList: 'Loading restaurants...',
    errorDefault: 'Error loading restaurants.',
    emptyList: 'No restaurants found with the current filters.',
    zoneFallback: 'Area not specified',
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
    pagination: { prev: 'Previous', next: 'Next', page: 'Page', of: 'of' },
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
      moreInfo: 'More info',
    },
    favorite: {
      add: 'Save as favorite',
      remove: 'Remove from favorites',
    },
  },
  pt: {
    pageTitle: 'Rota Foodie',
    pageSubtitle: 'Explore lugares recomendados.',
    loadingPage: 'Carregando...',
    loadingList: 'Carregando restaurantes...',
    errorDefault: 'Erro ao carregar restaurantes.',
    emptyList: 'Nenhum restaurante encontrado com os filtros atuais.',
    zoneFallback: 'Zona não especificada',
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
    pagination: { prev: 'Anterior', next: 'Próxima', page: 'Página', of: 'de' },
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
      moreInfo: 'Ver mais',
    },
    favorite: {
      add: 'Salvar como favorito',
      remove: 'Remover dos favoritos',
    },
  },
} as const

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

function getInstagramHandle(url: string | null): string {
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

function normalizeText(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function RestaurantesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

  const { locale } = useLocale()
  const t =
    RESTAURANTES_TEXTS[locale as keyof typeof RESTAURANTES_TEXTS] ??
    RESTAURANTES_TEXTS.es
  const apiLang: 'es' | 'en' | 'pt' =
    locale === 'en' ? 'en' : locale === 'pt' ? 'pt' : 'es'

  const restauranteIdParam = searchParams.get('restauranteId')
  const restauranteId = restauranteIdParam ? Number(restauranteIdParam) : null

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtros
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [tiposFilter, setTiposFilter] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // Favoritos
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<
    Set<number>
  >(new Set())
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // Guardia de auth
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

  // Traer restaurantes publicados
  useEffect(() => {
    if (!user) return

    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${PUBLIC_ENDPOINT}?lang=${apiLang}`, {
          method: 'GET',
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
  }, [user, apiLang])

  // Traer restaurantes favoritos del usuario
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        const headers: HeadersInit = {}
        if (auth?.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }

        const res = await fetch(FAVORITOS_RESTAURANTES_ENDPOINT, {
          method: 'GET',
          headers,
          credentials: 'include',
        })

        if (!res.ok) {
          console.error('Error cargando favoritos', await res.text())
          return
        }

        const data: any[] = await res.json()
        const ids = data
          .map((row) => Number(row.restaurante_id))
          .filter((id) => !Number.isNaN(id))

        setFavoriteRestaurantIds(new Set(ids))
      } catch (err) {
        console.error('Error cargando favoritos', err)
      }
    }

    fetchFavorites()
  }, [user, auth?.token])

  // Abrir modal si viene ?restauranteId=
  useEffect(() => {
    if (!restaurants.length) return
    if (!restauranteId) return

    const found = restaurants.find(
      (r) => Number(r.id) === Number(restauranteId)
    )

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

  const openModalFromCard = (place: Restaurant) => {
    setSelectedRestaurant(place)
    setIsModalOpen(true)
    router.push(`/restaurantes?restauranteId=${place.id}`)
  }

  // Toggle favorito
  const handleToggleFavorite = async (restaurant: Restaurant) => {
    if (!restaurant?.id) return

    const restauranteId = Number(restaurant.id)
    if (!restauranteId || Number.isNaN(restauranteId)) return

    setFavoriteLoading(true)

    try {
      const isFavorite = favoriteRestaurantIds.has(restauranteId)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (auth?.token) {
        headers['Authorization'] = `Bearer ${auth.token}`
      }

      const res = await fetch(FAVORITOS_RESTAURANTES_ENDPOINT, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ restauranteId }),
      })

      if (!res.ok) {
        console.error('Error al actualizar favorito', await res.text())
        return
      }

      setFavoriteRestaurantIds((prev) => {
        const next = new Set(prev)
        if (isFavorite) {
          next.delete(restauranteId)
        } else {
          next.add(restauranteId)
        }
        return next
      })
    } catch (err) {
      console.error('Error al actualizar favorito', err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  // Opciones dinámicas para filtros
  const zonas = useMemo(
    () =>
      Array.from(
        new Set(
          restaurants
            .map((r) => r.zona)
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
            .map((r) => r.rango_precios)
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
            .map((r) => r.tipo_comida)
            .filter((t): t is string => !!t && t.trim().length > 0)
        )
      ).sort(),
    [restaurants]
  )

  // Aplicar filtros
  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants]

    const term = normalizeText(search.trim())
    if (term) {
      result = result.filter((r) => {
        const nombre = normalizeText(r.nombre)
        const tipo = normalizeText(r.tipo_comida)
        const zona = normalizeText(r.zona)
        const ciudad = normalizeText(r.ciudad)
        return (
          nombre.includes(term) ||
          tipo.includes(term) ||
          zona.includes(term) ||
          ciudad.includes(term)
        )
      })
    }

    if (zonaFilter) {
      result = result.filter((r) => r.zona === zonaFilter)
    }

    if (priceFilter) {
      const priceNumber = Number(priceFilter)
      if (!Number.isNaN(priceNumber)) {
        result = result.filter((r) => r.rango_precios === priceNumber)
      }
    }

    if (tiposFilter.length > 0) {
      result = result.filter(
        (r) => r.tipo_comida && tiposFilter.includes(r.tipo_comida)
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

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [search, zonaFilter, priceFilter, tiposFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRestaurants.length / PAGE_SIZE)
  )

  const paginatedRestaurants = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredRestaurants.slice(start, start + PAGE_SIZE)
  }, [filteredRestaurants, currentPage])

  const toggleTipoComida = (tipo: string) => {
    setTiposFilter((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    )
  }

  if (isLoading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <h1 className="text-lg font-semibold">{t.pageTitle}</h1>
        <p className="text-xs text-slate-400">{t.pageSubtitle}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <TopNav isLoggedIn={isLoggedIn} />

      <main className="max-w-6xl mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Título */}
        <header className="flex flex-col gap-1 mb-1">
          <h1 className="text-lg font-semibold">{t.pageTitle}</h1>
          <p className="text-xs text-slate-400">{t.pageSubtitle}</p>
        </header>

        {/* Filtros */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3 space-y-3">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-2 text-sm font-semibold text-slate-100"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={14} />
              <span>{t.filters.title}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Buscador */}
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {t.filters.searchLabel}
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.filters.searchPlaceholder}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Zona */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {t.filters.zoneLabel}
                  </label>
                  <select
                    value={zonaFilter}
                    onChange={(e) => setZonaFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">{t.filters.zoneAll}</option>
                    {zonas.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rango de precios */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {t.filters.priceLabel}
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">{t.filters.priceAll}</option>
                    {precios.map((p) => (
                      <option key={p} value={p}>
                        {renderPriceRange(p)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multiselect tipo de comida */}
              {tiposComida.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-slate-300">
                    {t.filters.typeLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tiposComida.map((tipo) => {
                      const active = tiposFilter.includes(tipo)
                      return (
                        <button
                          key={tipo}
                          type="button"
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
        {loading && <p className="text-xs text-slate-400">{t.loadingList}</p>}

        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Listado */}
        {!loading && !error && filteredRestaurants.length === 0 && (
          <p className="text-xs text-slate-400">{t.emptyList}</p>
        )}

        {!loading && !error && filteredRestaurants.length > 0 && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedRestaurants.map((place) => (
                <div
                  key={place.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden"
                >
                  <div className="relative w-full h-36 sm:h-40 md:h-44 bg-slate-800">
                    <Image
                      alt={place.nombre}
                      src={
                        place.url_imagen ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>

                  <div className="p-3 flex-1 flex flex-col gap-1 text-[11px]">
                    <p className="text-[10px] uppercase font-semibold text-emerald-400">
                      {place.zona || t.zoneFallback}
                    </p>
                    <h3 className="text-sm font-semibold line-clamp-1">
                      {place.nombre}
                    </h3>

                    {place.descripcion_corta && (
                      <p className="text-slate-400 line-clamp-2">
                        {place.descripcion_corta}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      {typeof place.estrellas === 'number' &&
                        place.estrellas > 0 && (
                          <span className="inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300">
                            {place.estrellas}★
                          </span>
                        )}
                      <span className="text-slate-400">
                        {renderPriceRange(place.rango_precios)}
                      </span>
                    </div>

                    {place.tipo_comida && (
                      <span className="mt-1 inline-flex rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                        {place.tipo_comida}
                      </span>
                    )}

                    {place.direccion && (
                      <p className="mt-1 text-[10px] text-slate-500 line-clamp-1">
                        {place.direccion}
                      </p>
                    )}

                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => openModalFromCard(place)}
                        className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                      >
                        {t.modal.moreInfo}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-full border border-slate-700 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/70"
                >
                  {t.pagination.prev}
                </button>
                <span className="text-[11px] text-slate-400">
                  {t.pagination.page} {currentPage} {t.pagination.of}{' '}
                  {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-full border border-slate-700 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/70"
                >
                  {t.pagination.next}
                </button>
              </div>
            )}
          </>
        )}

        {/* MODAL detalle */}
        {isModalOpen && selectedRestaurant && (
          <div
            className="fixed inset-0 z-60 flex items-start justify-center bg-black/60 px-4"
            onClick={closeModal} // click en overlay cierra
          >
            <div
              className="relative mt-10 mb-6 w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 shadow-xl"
              onClick={(e) => e.stopPropagation()} // evita cerrar si clickeás dentro
            >
              {/* Botón cerrar arriba a la derecha */}
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-3 right-3 z-20
                           flex h-8 w-8 items-center justify-center
                           rounded-full bg-slate-900/80 border border-slate-700
                           text-sm text-slate-200 hover:bg-slate-800 transition"
              >
                ✕
              </button>

              <div className="px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-10 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-40 h-32 sm:h-40 rounded-xl overflow-hidden bg-slate-800">
                    <Image
                      alt={selectedRestaurant.nombre}
                      src={
                        selectedRestaurant.url_imagen ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 160px"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] uppercase font-semibold text-emerald-400">
                      {selectedRestaurant.zona || t.zoneFallback}
                    </p>
                    <h3 className="text-lg font-semibold">
                      {selectedRestaurant.nombre}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[12px]">
                      <span className="text-amber-400">
                        {renderStars(selectedRestaurant.estrellas)}
                      </span>
                      <span className="text-slate-400">
                        {renderPriceRange(selectedRestaurant.rango_precios)}
                      </span>
                      {selectedRestaurant.tipo_comida && (
                        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300">
                          {selectedRestaurant.tipo_comida}
                        </span>
                      )}
                    </div>

                    {selectedRestaurant.url_instagram && (
                      <a
                        href={selectedRestaurant.url_instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1"
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
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{t.modal.review}</h4>
                    <p className="text-[12px] text-slate-300 whitespace-pre-line text-justify md:text-left">
                      {selectedRestaurant.resena}
                    </p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      {t.modal.address}
                    </p>
                    <p className="text-slate-400">
                      {selectedRestaurant.direccion || t.modal.noData}
                    </p>
                    {selectedRestaurant.url_maps && (
                      <a
                        href={selectedRestaurant.url_maps}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 mt-1 inline-block"
                      >
                        {t.modal.howToGet}
                      </a>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      {t.modal.schedule}
                    </p>
                    <p className="text-slate-400">
                      {selectedRestaurant.horario_text || t.modal.noData}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      {t.modal.website}
                    </p>
                    {selectedRestaurant.sitio_web ? (
                      <a
                        href={selectedRestaurant.sitio_web}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all"
                      >
                        {selectedRestaurant.sitio_web}
                      </a>
                    ) : (
                      <p className="text-slate-400">{t.modal.noData}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      {t.modal.reservations}
                    </p>
                    {selectedRestaurant.url_reservas ||
                    selectedRestaurant.url_reserva ? (
                      <a
                        href={
                          selectedRestaurant.url_reservas ||
                          selectedRestaurant.url_reserva ||
                          '#'
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all"
                      >
                        {t.modal.reservationsCta}
                      </a>
                    ) : (
                      <p className="text-slate-400">{t.modal.noData}</p>
                    )}
                  </div>
                </div>

                {selectedRestaurant && (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                    >
                      {t.modal.close}
                    </button>

                    {(() => {
                      const isFavorite = favoriteRestaurantIds.has(
                        Number(selectedRestaurant.id)
                      )

                      return (
                        <button
                          type="button"
                          disabled={favoriteLoading}
                          onClick={() =>
                            handleToggleFavorite(selectedRestaurant)
                          }
                          className={`rounded-full px-4 py-1.5 text-xs font-medium flex items-center gap-1 transition
                            ${
                              isFavorite
                                ? 'border border-emerald-400 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'border border-slate-700 text-slate-200 hover:border-emerald-400 hover:bg-slate-800'
                            }
                          `}
                        >
                          {isFavorite ? t.favorite.remove : t.favorite.add}
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
