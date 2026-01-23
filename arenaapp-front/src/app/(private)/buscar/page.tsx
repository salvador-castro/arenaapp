'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import Image from 'next/image'
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  Calendar,
  Utensils,
  Wine,
  Hotel,
  PartyPopper,
  ShoppingBag,
  Camera,
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'

// Tipos para cada entidad
interface BaseEntity {
  id: number | string
  nombre?: string
  titulo?: string
  zona?: string
  ciudad?: string
  provincia?: string
  url_imagen?: string
  imagen_principal?: string
  es_destacado: boolean
}

interface Restaurante extends BaseEntity {
  tipo_comida?: string | null
  rango_precios?: number | null
  estrellas?: number | null
}

interface Bar extends BaseEntity {
  tipo_comida?: string | null
  rango_precios?: number | null
  estrellas?: number | null
}

interface Hotel extends BaseEntity {
  categoria_estrellas?: number | null
}

interface Evento extends BaseEntity {
  categoria?: string
  fecha_inicio?: string
  estrellas?: number | null
}

interface Shopping extends BaseEntity {
  cantidad_locales?: number | null
  es_outlet?: boolean | null
  estrellas?: number | null
}

interface Galeria extends BaseEntity {
  categoria?: string
  estrellas?: number | null
}

type ContentType =
  | 'all'
  | 'restaurante'
  | 'bar'
  | 'hotel'
  | 'evento'
  | 'shopping'
  | 'galeria'

interface SearchResult {
  id: number | string
  type: ContentType
  title: string
  subtitle?: string
  zone?: string
  city?: string
  image?: string
  badges: string[]
  detailUrl: string
  isHighlighted: boolean
  stars?: number
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const ENDPOINTS = {
  restaurantes: `${API_BASE}/api/admin/restaurantes/public`,
  bares: `${API_BASE}/api/admin/bares/public`,
  hoteles: `${API_BASE}/api/admin/hoteles/public`,
  eventos: `${API_BASE}/api/admin/eventos/public`,
  shopping: `${API_BASE}/api/admin/shopping/public`,
  galerias: `${API_BASE}/api/admin/galerias/public`,
}

const PAGE_SIZE = 12

const BUSCAR_TEXTS = {
  es: {
    pageTitle: 'Buscar',
    pageSubtitle:
      'Buscá en todo el sitio: restaurantes, bares, hoteles, eventos y más.',
    searchPlaceholder: 'Buscar...',
    filters: {
      title: 'Filtros',
      show: 'Mostrar filtros',
      hide: 'Ocultar filtros',
      contentType: 'Tipo de contenido',
      zone: 'Zona',
      zoneAll: 'Todas las zonas',
      price: 'Rango de precios',
      priceAll: 'Todos los precios',
      stars: 'Estrellas',
      starsAll: 'Todas las estrellas',
      clearFilters: 'Limpiar filtros',
    },
    contentTypes: {
      all: 'Todo',
      restaurante: 'Restaurantes',
      bar: 'Bares',
      hotel: 'Hoteles',
      evento: 'Eventos',
      shopping: 'Shopping',
      galeria: 'Galerías',
    },
    loading: 'Cargando...',
    error: 'Error al cargar resultados',
    noResults: 'No se encontraron resultados',
    noSearch: 'Ingresá un término de búsqueda para ver resultados',
    pagination: {
      prev: 'Anterior',
      next: 'Siguiente',
      page: 'Página',
      of: 'de',
    },
    resultsCount: (count: number) =>
      `${count} resultado${count !== 1 ? 's' : ''}`,
  },
  en: {
    pageTitle: 'Search',
    pageSubtitle:
      'Search the entire site: restaurants, bars, hotels, events and more.',
    searchPlaceholder: 'Search...',
    filters: {
      title: 'Filters',
      show: 'Show filters',
      hide: 'Hide filters',
      contentType: 'Content type',
      zone: 'Area',
      zoneAll: 'All areas',
      price: 'Price range',
      priceAll: 'All prices',
      stars: 'Stars',
      starsAll: 'All stars',
      clearFilters: 'Clear filters',
    },
    contentTypes: {
      all: 'All',
      restaurante: 'Restaurants',
      bar: 'Bars',
      hotel: 'Hotels',
      evento: 'Events',
      shopping: 'Shopping',
      galeria: 'Galleries',
    },
    loading: 'Loading...',
    error: 'Error loading results',
    noResults: 'No results found',
    noSearch: 'Enter a search term to see results',
    pagination: {
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
    },
    resultsCount: (count: number) => `${count} result${count !== 1 ? 's' : ''}`,
  },
  pt: {
    pageTitle: 'Buscar',
    pageSubtitle:
      'Busque em todo o site: restaurantes, bares, hotéis, eventos e mais.',
    searchPlaceholder: 'Buscar...',
    filters: {
      title: 'Filtros',
      show: 'Mostrar filtros',
      hide: 'Ocultar filtros',
      contentType: 'Tipo de conteúdo',
      zone: 'Zona',
      zoneAll: 'Todas as zonas',
      price: 'Faixa de preço',
      priceAll: 'Todos os preços',
      stars: 'Estrelas',
      starsAll: 'Todas as estrelas',
      clearFilters: 'Limpar filtros',
    },
    contentTypes: {
      all: 'Tudo',
      restaurante: 'Restaurantes',
      bar: 'Bares',
      hotel: 'Hotéis',
      evento: 'Eventos',
      shopping: 'Shopping',
      galeria: 'Galerias',
    },
    loading: 'Carregando...',
    error: 'Erro ao carregar resultados',
    noResults: 'Nenhum resultado encontrado',
    noSearch: 'Digite um termo de busca para ver resultados',
    pagination: {
      prev: 'Anterior',
      next: 'Próxima',
      page: 'Página',
      of: 'de',
    },
    resultsCount: (count: number) =>
      `${count} resultado${count !== 1 ? 's' : ''}`,
  },
} as const

function normalizeText(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function renderStars(estrellas: number | null | undefined): string {
  if (!estrellas || estrellas < 1) return '-'
  const value = Math.min(Math.max(estrellas, 1), 5)
  return '★'.repeat(value)
}

function getContentTypeIcon(type: ContentType, size = 14) {
  switch (type) {
    case 'restaurante':
      return <Utensils size={size} />
    case 'bar':
      return <Wine size={size} />
    case 'hotel':
      return <Hotel size={size} />
    case 'evento':
      return <PartyPopper size={size} />
    case 'shopping':
      return <ShoppingBag size={size} />
    case 'galeria':
      return <Camera size={size} />
    default:
      return null
  }
}

function getContentTypeColor(type: ContentType): string {
  switch (type) {
    case 'restaurante':
      return 'border-orange-500/60 bg-orange-500/10 text-orange-300'
    case 'bar':
      return 'border-purple-500/60 bg-purple-500/10 text-purple-300'
    case 'hotel':
      return 'border-blue-500/60 bg-blue-500/10 text-blue-300'
    case 'evento':
      return 'border-pink-500/60 bg-pink-500/10 text-pink-300'
    case 'shopping':
      return 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
    case 'galeria':
      return 'border-yellow-500/60 bg-yellow-500/10 text-yellow-300'
    default:
      return 'border-slate-700 bg-slate-900/60 text-slate-300'
  }
}

export default function BuscarPage() {
  const router = useRouter()
  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

  const { locale } = useLocale()
  const t = BUSCAR_TEXTS[locale as keyof typeof BUSCAR_TEXTS] ?? BUSCAR_TEXTS.es
  const apiLang: 'es' | 'en' | 'pt' =
    locale === 'en' ? 'en' : locale === 'pt' ? 'pt' : 'es'

  // Estado de datos
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([])
  const [bares, setBares] = useState<Bar[]>([])
  const [hoteles, setHoteles] = useState<Hotel[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [shoppings, setShoppings] = useState<Shopping[]>([])
  const [galerias, setGalerias] = useState<Galeria[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [search, setSearch] = useState('')
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType>('all')
  const [zoneFilter, setZoneFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [starsFilter, setStarsFilter] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Guardia de auth
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent('/buscar')}`)
      return
    }
  }, [user, isLoading, router])

  // Fetch all data
  useEffect(() => {
    if (!user) return

    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [
          restaurantesRes,
          baresRes,
          hotelesRes,
          eventosRes,
          shoppingsRes,
          galeriasRes,
        ] = await Promise.all([
          fetch(`${ENDPOINTS.restaurantes}?lang=${apiLang}`),
          fetch(`${ENDPOINTS.bares}?lang=${apiLang}`),
          fetch(`${ENDPOINTS.hoteles}?lang=${apiLang}`),
          fetch(`${ENDPOINTS.eventos}?lang=${apiLang}`),
          fetch(`${ENDPOINTS.shopping}?lang=${apiLang}`),
          fetch(`${ENDPOINTS.galerias}?lang=${apiLang}`),
        ])

        if (
          !restaurantesRes.ok ||
          !baresRes.ok ||
          !hotelesRes.ok ||
          !eventosRes.ok ||
          !shoppingsRes.ok ||
          !galeriasRes.ok
        ) {
          throw new Error('Error loading data')
        }

        const [
          restaurantesData,
          baresData,
          hotelesData,
          eventosData,
          shoppingsData,
          galeriasData,
        ] = await Promise.all([
          restaurantesRes.json(),
          baresRes.json(),
          hotelesRes.json(),
          eventosRes.json(),
          shoppingsRes.json(),
          galeriasRes.json(),
        ])

        setRestaurantes(restaurantesData)
        setBares(baresData)
        setHoteles(hotelesData)
        setEventos(eventosData)
        setShoppings(shoppingsData)
        setGalerias(galeriasData)
      } catch (err: any) {
        console.error('Error loading search data', err)
        setError(err.message ?? 'Error loading data')
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [user, apiLang])

  // Extraer zonas únicas de todos los datos
  const allZones = useMemo(() => {
    const zones = new Set<string>()
    ;[
      ...restaurantes,
      ...bares,
      ...hoteles,
      ...eventos,
      ...shoppings,
      ...galerias,
    ].forEach((item) => {
      if (item.zona && item.zona.trim()) zones.add(item.zona)
    })
    return Array.from(zones).sort()
  }, [restaurantes, bares, hoteles, eventos, shoppings, galerias])

  // Extraer rangos de precio únicos (solo de restaurantes, bares y shopping que tienen este campo)
  const allPrices = useMemo(() => {
    const prices = new Set<number>()
    ;[...restaurantes, ...bares, ...shoppings].forEach((item) => {
      if (
        'rango_precios' in item &&
        typeof item.rango_precios === 'number' &&
        item.rango_precios > 0
      ) {
        prices.add(item.rango_precios)
      }
    })
    return Array.from(prices).sort((a, b) => a - b)
  }, [restaurantes, bares, shoppings])

  // Extraer estrellas únicas (de restaurantes, bares, hoteles, shopping, eventos y galerías)
  const allStars = useMemo(() => {
    const stars = new Set<number>()
    ;[...restaurantes, ...bares, ...shoppings, ...eventos, ...galerias].forEach(
      (item) => {
        if (
          'estrellas' in item &&
          typeof item.estrellas === 'number' &&
          item.estrellas > 0
        ) {
          stars.add(item.estrellas)
        }
      }
    )
    ;[...hoteles].forEach((item) => {
      if (
        'categoria_estrellas' in item &&
        typeof item.categoria_estrellas === 'number' &&
        item.categoria_estrellas > 0
      ) {
        stars.add(item.categoria_estrellas)
      }
    })
    return Array.from(stars).sort((a, b) => a - b)
  }, [restaurantes, bares, hoteles, shoppings, eventos, galerias])

  // Convertir todas las entidades a SearchResults
  const allResults: SearchResult[] = useMemo(() => {
    const results: SearchResult[] = []

    // Restaurantes
    restaurantes.forEach((r) => {
      const badges: string[] = []
      if (r.tipo_comida) badges.push(r.tipo_comida)
      if (r.rango_precios) badges.push('$'.repeat(r.rango_precios))
      // Las estrellas se mostrarán separadas, no en badges
      // if (r.estrellas) badges.push('★'.repeat(r.estrellas))

      results.push({
        id: r.id,
        type: 'restaurante',
        title: r.nombre || '',
        zone: r.zona || undefined,
        city: r.ciudad || undefined,
        image:
          r.url_imagen || '/images/placeholders/restaurante-placeholder.jpg',
        badges,
        detailUrl: `/restaurantes?restauranteId=${r.id}`,
        isHighlighted: r.es_destacado,
        stars: r.estrellas || undefined,
      })
    })

    // Bares
    bares.forEach((b) => {
      const badges: string[] = []
      if (b.tipo_comida) badges.push(b.tipo_comida)
      if (b.rango_precios) badges.push('$'.repeat(b.rango_precios))
      // Las estrellas se mostrarán separadas, no en badges
      // if (b.estrellas) badges.push('★'.repeat(b.estrellas))

      results.push({
        id: b.id,
        type: 'bar',
        title: b.nombre || '',
        zone: b.zona || undefined,
        city: b.ciudad || undefined,
        image: b.url_imagen || '/images/placeholders/bar-placeholder.jpg',
        badges,
        detailUrl: `/bares?barId=${b.id}`,
        isHighlighted: b.es_destacado,
        stars: b.estrellas || undefined,
      })
    })

    // Hoteles
    hoteles.forEach((h) => {
      const badges: string[] = []
      // Las estrellas se mostrarán separadas, no en badges
      // if (h.categoria_estrellas) badges.push('★'.repeat(h.categoria_estrellas))

      results.push({
        id: h.id,
        type: 'hotel',
        title: h.nombre || '',
        zone: h.zona || undefined,
        city: h.ciudad || undefined,
        image: h.url_imagen || '/images/placeholders/hotel-placeholder.jpg',
        badges,
        detailUrl: `/hoteles?hotelId=${h.id}`,
        isHighlighted: h.es_destacado,
        stars: h.categoria_estrellas || undefined,
      })
    })

    // Eventos
    eventos.forEach((e) => {
      const badges: string[] = []
      if (e.categoria) badges.push(e.categoria)

      results.push({
        id: e.id,
        type: 'evento',
        title: e.titulo || '',
        zone: e.zona || undefined,
        city: e.ciudad || undefined,
        image:
          e.imagen_principal || '/images/placeholders/evento-placeholder.jpg',
        badges,
        detailUrl: `/eventos?eventoId=${e.id}`,
        isHighlighted: e.es_destacado,
        stars: e.estrellas || undefined,
      })
    })

    // Shopping
    shoppings.forEach((s) => {
      const badges: string[] = []
      if (s.es_outlet) badges.push('Outlet')
      if (s.cantidad_locales) badges.push(`${s.cantidad_locales} locales`)

      results.push({
        id: s.id,
        type: 'shopping',
        title: s.nombre || '',
        zone: s.zona || undefined,
        city: s.ciudad || undefined,
        image:
          s.url_imagen || '/images/placeholders/restaurante-placeholder.jpg',
        badges,
        detailUrl: `/shopping?shoppingId=${s.id}`,
        isHighlighted: s.es_destacado,
        stars: s.estrellas || undefined,
      })
    })

    // Galerías
    galerias.forEach((g) => {
      const badges: string[] = []
      if (g.categoria) badges.push(g.categoria)

      results.push({
        id: g.id,
        type: 'galeria',
        title: g.nombre || '',
        zone: g.zona || undefined,
        city: g.ciudad || undefined,
        image:
          g.url_imagen || '/images/placeholders/restaurante-placeholder.jpg',
        badges,
        detailUrl: `/galerias-museos?galeriaId=${g.id}`,
        isHighlighted: g.es_destacado,
        stars: g.estrellas || undefined,
      })
    })

    return results
  }, [restaurantes, bares, hoteles, eventos, shoppings, galerias])

  // Filtrar resultados
  const filteredResults = useMemo(() => {
    let results = [...allResults]

    // Filtro por tipo de contenido
    if (contentTypeFilter !== 'all') {
      results = results.filter((r) => r.type === contentTypeFilter)
    }

    // Filtro por zona
    if (zoneFilter) {
      results = results.filter((r) => r.zone === zoneFilter)
    }

    // Filtro por precio
    if (priceFilter) {
      const priceNum = Number(priceFilter)
      results = results.filter((r) => {
        // Solo aplicar filtro de precio a resultados que tengan precio en sus badges
        return r.badges.some((badge) => badge === '$'.repeat(priceNum))
      })
    }

    // Filtro por estrellas
    if (starsFilter) {
      const starsNum = Number(starsFilter)
      results = results.filter((r) => {
        // Comparar directamente con el campo stars del resultado
        return r.stars === starsNum
      })
    }

    // Filtro de búsqueda
    const term = normalizeText(search.trim())
    if (term) {
      results = results.filter((r) => {
        const title = normalizeText(r.title)
        const zone = normalizeText(r.zone)
        const city = normalizeText(r.city)
        const badges = r.badges.map(normalizeText).join(' ')
        const typeName = normalizeText(t.contentTypes[r.type])

        return (
          title.includes(term) ||
          zone.includes(term) ||
          city.includes(term) ||
          badges.includes(term) ||
          typeName.includes(term)
        )
      })
    }

    // Ordenar: destacados primero, luego por título
    results.sort((a, b) => {
      if (a.isHighlighted && !b.isHighlighted) return -1
      if (!a.isHighlighted && b.isHighlighted) return 1
      return a.title.localeCompare(b.title)
    })

    return results
  }, [
    allResults,
    search,
    contentTypeFilter,
    zoneFilter,
    priceFilter,
    starsFilter,
    t,
  ])

  // Reset page cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [search, contentTypeFilter, zoneFilter, priceFilter, starsFilter])

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE))

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredResults.slice(start, start + PAGE_SIZE)
  }, [filteredResults, currentPage])

  if (isLoading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">{t.loading}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <TopNav isLoggedIn={isLoggedIn} />

      <main className="max-w-6xl mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Header */}
        <header className="flex flex-col gap-1 mb-1">
          <h1 className="text-lg font-semibold">{t.pageTitle}</h1>
          <p className="text-xs text-slate-400">{t.pageSubtitle}</p>
        </header>

        {/* Search bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className="flex-1 flex items-center justify-between gap-2 text-sm font-semibold text-slate-100"
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

            {/* Clear filters button - only show if any filter is active */}
            {(contentTypeFilter !== 'all' ||
              zoneFilter ||
              priceFilter ||
              starsFilter ||
              search.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setContentTypeFilter('all')
                  setZoneFilter('')
                  setPriceFilter('')
                  setStarsFilter('')
                }}
                className="rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-700/60 hover:text-slate-100 transition-colors whitespace-nowrap"
              >
                {t.filters.clearFilters}
              </button>
            )}
          </div>

          {filtersOpen && (
            <div className="space-y-3">
              {/* Tipo de contenido */}
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-slate-300">
                  {t.filters.contentType}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      'all',
                      'restaurante',
                      'bar',
                      'hotel',
                      'evento',
                      'shopping',
                      'galeria',
                    ] as ContentType[]
                  ).map((type) => {
                    const active = contentTypeFilter === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setContentTypeFilter(type)}
                        className={`rounded-full border px-3 py-1.5 text-[11px] flex items-center gap-1.5 transition-colors ${
                          active
                            ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                            : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-emerald-400/60'
                        }`}
                      >
                        {type !== 'all' && getContentTypeIcon(type, 12)}
                        {t.contentTypes[type]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Zona, Precio y Estrellas en fila */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Filtro de Zona */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {t.filters.zone}
                  </label>
                  <select
                    value={zoneFilter}
                    onChange={(e) => setZoneFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">{t.filters.zoneAll}</option>
                    {allZones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro de Precio */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {t.filters.price}
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">{t.filters.priceAll}</option>
                    {allPrices.map((price) => (
                      <option key={price} value={price}>
                        {'$'.repeat(price)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro de Estrellas */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {t.filters.stars}
                  </label>
                  <select
                    value={starsFilter}
                    onChange={(e) => setStarsFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">{t.filters.starsAll}</option>
                    {allStars.map((stars) => (
                      <option key={stars} value={stars}>
                        {'★'.repeat(stars)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Estado y contador */}
        {loading && <p className="text-xs text-slate-400">{t.loading}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}

        {!loading && !error && filteredResults.length === 0 && (
          <p className="text-xs text-slate-400">{t.noResults}</p>
        )}

        {!loading && !error && filteredResults.length > 0 && (
          <>
            <p className="text-xs text-slate-400">
              {t.resultsCount(filteredResults.length)}
            </p>

            {/* Results grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => router.push(result.detailUrl)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden cursor-pointer"
                >
                  <div className="relative w-full h-36 sm:h-40 md:h-44 bg-slate-800">
                    <Image
                      alt={result.title}
                      src={
                        result.image ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>

                  <div className="p-3 flex-1 flex flex-col gap-1 text-[11px]">
                    {/* Content type badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${getContentTypeColor(
                          result.type
                        )}`}
                      >
                        {getContentTypeIcon(result.type, 10)}
                        {t.contentTypes[result.type]}
                      </span>
                    </div>

                    {/* Zone/City */}
                    <p className="text-[10px] uppercase font-semibold text-emerald-400">
                      {result.zone || result.city || '-'}
                    </p>

                    {/* Title */}
                    <h3 className="text-sm font-semibold line-clamp-2">
                      {result.title}
                    </h3>

                    {/* Stars and Price Range */}
                    {(result.stars ||
                      result.badges.some((b) => b.startsWith('$'))) && (
                      <div className="flex items-center gap-2 mt-1">
                        {result.stars && result.stars > 0 && (
                          <span className="text-amber-400">
                            {renderStars(result.stars)}
                          </span>
                        )}
                        {result.badges
                          .filter((b) => b.startsWith('$'))
                          .map((badge, idx) => (
                            <span key={idx} className="text-slate-400">
                              {badge}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Other Badges (tipo de comida, etc) */}
                    {result.badges.filter((b) => !b.startsWith('$')).length >
                      0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.badges
                          .filter((b) => !b.startsWith('$'))
                          .slice(0, 2)
                          .map((badge, idx) => (
                            <span
                              key={idx}
                              className="inline-flex rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300"
                            >
                              {badge}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>

            {/* Pagination */}
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
      </main>

      <BottomNav />
    </div>
  )
}
