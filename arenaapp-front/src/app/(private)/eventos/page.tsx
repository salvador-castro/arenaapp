// /Users/salvacastro/Desktop/arenaapp/arenaapp-front/src/app/(private)/eventos/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import {
  SlidersHorizontal,
  ChevronDown,
  CalendarDays,
  Ticket,
  MapPin,
  Heart,
  HeartOff,
  Loader2,
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'
import { useLocale } from '@/context/LocaleContext'

interface Evento {
  id: number | string
  titulo: string
  categoria: string
  es_destacado: boolean
  fecha_inicio: string
  fecha_fin: string | null
  es_todo_el_dia: boolean
  zona: string | null
  direccion: string | null
  es_gratuito: boolean
  precio_desde: number | null
  moneda: string | null
  url_entradas: string | null
  estado: string
  resena: string | null
  imagen_principal: string | null
  estrellas?: number | null
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const PUBLIC_ENDPOINT = `${API_BASE}/api/admin/eventos/public`
const FAVORITOS_EVENTOS_ENDPOINT = `${API_BASE}/api/admin/favoritos/eventos`
const PAGE_SIZE = 12

const EVENTOS_TEXTS = {
  es: {
    pageTitle: 'Eventos',
    pageSubtitle: 'Descubrí qué está pasando en la ciudad.',
    loadingPage: 'Cargando...',
    loadingList: 'Cargando eventos...',
    errorDefault: 'Error al cargar eventos.',
    emptyList: 'No se encontraron eventos con los filtros actuales.',
    filters: {
      title: 'Filtros',
      show: 'Mostrar filtros',
      hide: 'Ocultar filtros',
      searchLabel: 'Buscar',
      searchPlaceholder: 'Título, zona, categoría...',
      zoneLabel: 'Zona',
      zoneAll: 'Todas',
      categoryLabel: 'Categoría',
      categoryAll: 'Todas',
    },
    zoneFallback: 'Zona no especificada',
    price: {
      free: 'Gratuito',
      from: 'Desde',
      consult: 'Consultar precio',
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
      tickets: 'Entradas',
      ticketsCta: 'Comprar entradas',
      ticketsUnavailable: 'No disponible',
      close: 'Cerrar',
      noData: '-',
    },
    date: {
      allDayLabel: 'todo el día',
    },
    favorite: {
      add: 'Guardar como favorito',
      remove: 'Quitar de favoritos',
    },
    moreInfo: 'Más info',
  },
  en: {
    pageTitle: 'Events',
    pageSubtitle: 'Discover what’s happening in the city.',
    loadingPage: 'Loading...',
    loadingList: 'Loading events...',
    errorDefault: 'Error loading events.',
    emptyList: 'No events found with the current filters.',
    filters: {
      title: 'Filters',
      show: 'Show filters',
      hide: 'Hide filters',
      searchLabel: 'Search',
      searchPlaceholder: 'Title, area, category...',
      zoneLabel: 'Area',
      zoneAll: 'All',
      categoryLabel: 'Category',
      categoryAll: 'All',
    },
    zoneFallback: 'Area not specified',
    price: {
      free: 'Free',
      from: 'From',
      consult: 'Check price',
    },
    pagination: {
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of',
    },
    modal: {
      review: 'Review',
      address: 'Address',
      tickets: 'Tickets',
      ticketsCta: 'Buy tickets',
      ticketsUnavailable: 'Not available',
      close: 'Close',
      noData: '-',
    },
    date: {
      allDayLabel: 'all day',
    },
    favorite: {
      add: 'Save as favorite',
      remove: 'Remove from favorites',
    },
    moreInfo: 'More info',
  },
  pt: {
    pageTitle: 'Eventos',
    pageSubtitle: 'Descubra o que está acontecendo na cidade.',
    loadingPage: 'Carregando...',
    loadingList: 'Carregando eventos...',
    errorDefault: 'Erro ao carregar eventos.',
    emptyList: 'Nenhum evento encontrado com os filtros atuais.',
    filters: {
      title: 'Filtros',
      show: 'Mostrar filtros',
      hide: 'Ocultar filtros',
      searchLabel: 'Buscar',
      searchPlaceholder: 'Título, zona, categoria...',
      zoneLabel: 'Zona',
      zoneAll: 'Todas',
      categoryLabel: 'Categoria',
      categoryAll: 'Todas',
    },
    zoneFallback: 'Zona não especificada',
    price: {
      free: 'Gratuito',
      from: 'Desde',
      consult: 'Consultar preço',
    },
    pagination: {
      prev: 'Anterior',
      next: 'Próxima',
      page: 'Página',
      of: 'de',
    },
    modal: {
      review: 'Resenha',
      address: 'Endereço',
      tickets: 'Ingressos',
      ticketsCta: 'Comprar ingressos',
      ticketsUnavailable: 'Não disponível',
      close: 'Fechar',
      noData: '-',
    },
    date: {
      allDayLabel: 'o dia todo',
    },
    favorite: {
      add: 'Salvar como favorito',
      remove: 'Remover dos favoritos',
    },
    moreInfo: 'Ver mais',
  },
} as const

const DATE_LOCALES = {
  es: 'es-AR',
  en: 'en-US',
  pt: 'pt-BR',
} as const

type SupportedLocale = keyof typeof DATE_LOCALES

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

function formatEventDateRange(
  inicio: string | null,
  fin: string | null,
  todoElDia: boolean,
  localeKey: SupportedLocale,
  allDayLabel: string
): string {
  if (!inicio) return '-'

  const start = new Date(inicio)
  const end = fin ? new Date(fin) : null

  const localeCode = DATE_LOCALES[localeKey]

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }

  const dateStr = start.toLocaleDateString(localeCode, dateOptions)

  if (todoElDia) {
    if (end && end.toDateString() !== start.toDateString()) {
      const endDateStr = end.toLocaleDateString(localeCode, dateOptions)
      return `${dateStr} - ${endDateStr} (${allDayLabel})`
    }
    return `${dateStr} (${allDayLabel})`
  }

  const startTimeStr = start.toLocaleTimeString(localeCode, timeOptions)

  if (end) {
    const sameDay = start.toDateString() === end.toDateString()
    const endTimeStr = end.toLocaleTimeString(localeCode, timeOptions)
    if (sameDay) {
      return `${dateStr} ${startTimeStr} - ${endTimeStr}`
    } else {
      const endDateStr = end.toLocaleDateString(localeCode, dateOptions)
      return `${dateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`
    }
  }

  return `${dateStr} ${startTimeStr}`
}

export default function EventosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

  const { locale } = useLocale()
  const t =
    EVENTOS_TEXTS[locale as keyof typeof EVENTOS_TEXTS] ?? EVENTOS_TEXTS.es
  const apiLang: 'es' | 'en' | 'pt' =
    locale === 'en' ? 'en' : locale === 'pt' ? 'pt' : 'es'
  const eventLocaleKey: SupportedLocale = (
    ['es', 'en', 'pt'] as const
  ).includes(locale as any)
    ? (locale as SupportedLocale)
    : 'es'

  const eventoIdParam = searchParams.get('eventoId')
  const eventoId = eventoIdParam ? Number(eventoIdParam) : null

  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // filtros
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // favoritos
  const [favoriteEventIds, setFavoriteEventIds] = useState<Set<number>>(
    new Set()
  )
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // 1) Guardia de auth
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const redirectUrl = eventoId
        ? `/eventos?eventoId=${eventoId}`
        : '/eventos'

      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }
  }, [user, isLoading, router, eventoId])

  // 2) Traer todos los eventos PUBLICADOS
  useEffect(() => {
    if (!user) return

    const fetchEventos = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${PUBLIC_ENDPOINT}?lang=${apiLang}`, {
          method: 'GET',
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Evento[] = await res.json()
        setEventos(data)
      } catch (err: any) {
        console.error('Error cargando eventos públicos', err)
        setError(err?.message ?? EVENTOS_TEXTS.es.errorDefault)
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [user, apiLang])

  // 3) Traer favoritos de eventos del usuario
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        const headers: HeadersInit = {}
        if (auth?.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }

        const res = await fetch(FAVORITOS_EVENTOS_ENDPOINT, {
          method: 'GET',
          headers,
          credentials: 'include',
        })

        if (!res.ok) {
          console.error('Error cargando favoritos de eventos', await res.text())
          return
        }

        const data: any[] = await res.json()
        const ids = data
          .map((row) => Number(row.evento_id))
          .filter((id) => !Number.isNaN(id))

        setFavoriteEventIds(new Set(ids))
      } catch (err) {
        console.error('Error cargando favoritos de eventos', err)
      }
    }

    fetchFavorites()
  }, [user, auth?.token])

  // 4) Si venimos con ?eventoId=, abrir ese modal cuando ya hay data
  useEffect(() => {
    if (!eventos.length) return
    if (!eventoId) return

    const found = eventos.find((e) => Number(e.id) === Number(eventoId))
    if (found) {
      setSelectedEvento(found)
      setIsModalOpen(true)
    }
  }, [eventos, eventoId])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedEvento(null)
    router.push('/eventos')
  }

  const openModalFromCard = (evento: Evento) => {
    setSelectedEvento(evento)
    setIsModalOpen(true)
    router.push(`/eventos?eventoId=${evento.id}`)
  }

  // 5) Opciones dinámicas
  const zonas = useMemo(
    () =>
      Array.from(
        new Set(
          eventos
            .map((e) => e.zona)
            .filter((z): z is string => !!z && z.trim().length > 0)
        )
      ).sort(),
    [eventos]
  )

  const categorias = useMemo(
    () =>
      Array.from(
        new Set(
          eventos
            .map((e) => e.categoria)
            .filter((c): c is string => !!c && c.trim().length > 0)
        )
      ).sort(),
    [eventos]
  )

  // 6) Aplicar filtros
  const filteredEventos = useMemo(() => {
    let result = [...eventos]

    const term = normalizeText(search.trim())
    if (term) {
      result = result.filter((e) => {
        const titulo = normalizeText(e.titulo)
        const zona = normalizeText(e.zona)
        const categoria = normalizeText(e.categoria)
        return (
          titulo.includes(term) ||
          zona.includes(term) ||
          categoria.includes(term)
        )
      })
    }

    if (zonaFilter) {
      result = result.filter((e) => e.zona === zonaFilter)
    }

    if (categoriaFilter) {
      result = result.filter((e) => e.categoria === categoriaFilter)
    }

    // orden: destacados primero, luego por fecha de inicio asc
    result.sort((a, b) => {
      if (a.es_destacado && !b.es_destacado) return -1
      if (!a.es_destacado && b.es_destacado) return 1

      const da = a.fecha_inicio ? new Date(a.fecha_inicio).getTime() : 0
      const db = b.fecha_inicio ? new Date(b.fecha_inicio).getTime() : 0
      return da - db
    })

    return result
  }, [eventos, search, zonaFilter, categoriaFilter])

  // Reset a página 1 cuando cambian filtros/búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [search, zonaFilter, categoriaFilter])

  const totalPages = Math.max(1, Math.ceil(filteredEventos.length / PAGE_SIZE))

  const paginatedEventos = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredEventos.slice(start, start + PAGE_SIZE)
  }, [filteredEventos, currentPage])

  const handleToggleFavorite = async (evento: Evento) => {
    if (!evento?.id) return

    const eventoId = Number(evento.id)
    if (!eventoId || Number.isNaN(eventoId)) return

    setFavoriteLoading(true)

    try {
      const isFavorite = favoriteEventIds.has(eventoId)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (auth?.token) {
        headers['Authorization'] = `Bearer ${auth.token}`
      }

      const res = await fetch(FAVORITOS_EVENTOS_ENDPOINT, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ eventoId }),
      })

      if (!res.ok) {
        console.error(
          'Error al actualizar favorito de evento',
          await res.text()
        )
        return
      }

      setFavoriteEventIds((prev) => {
        const next = new Set(prev)
        if (isFavorite) {
          next.delete(eventoId)
        } else {
          next.add(eventoId)
        }
        return next
      })
    } catch (err) {
      console.error('Error al actualizar favorito de evento', err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  if (isLoading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">{t.loadingPage}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Navbar reutilizable: logo + UserDropdown */}
      <TopNav isLoggedIn={isLoggedIn} />

      <main className="max-w-6xl mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Título de la página */}
        <header className="flex flex-col gap-1 mb-1">
          <h1 className="text-lg font-semibold">{t.pageTitle}</h1>
          <p className="text-xs text-slate-400">{t.pageSubtitle}</p>
        </header>

        {/* Filtros colapsables */}
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

                {/* Categoría */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {t.filters.categoryLabel}
                  </label>
                  <select
                    value={categoriaFilter}
                    onChange={(e) => setCategoriaFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">{t.filters.categoryAll}</option>
                    {categorias.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Estado de carga / error */}
        {loading && <p className="text-xs text-slate-400">{t.loadingList}</p>}

        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Listado */}
        {!loading && !error && filteredEventos.length === 0 && (
          <p className="text-xs text-slate-400">{t.emptyList}</p>
        )}

        {!loading && !error && filteredEventos.length > 0 && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedEventos.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden"
                >
                  <div className="relative w-full h-36 sm:h-40 md:h-44 bg-slate-800">
                    <Image
                      alt={ev.titulo}
                      src={
                        ev.imagen_principal ||
                        '/images/placeholders/evento-placeholder.jpg'
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>

                  <div className="p-3 flex-1 flex flex-col gap-1 text-[11px]">
                    <p className="text-[10px] uppercase font-semibold text-emerald-400">
                      {ev.zona || t.zoneFallback}
                    </p>
                    <h3 className="text-sm font-semibold line-clamp-1">
                      {ev.titulo}
                    </h3>

                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-300">
                      <CalendarDays size={12} className="shrink-0" />
                      <span className="line-clamp-2">
                        {formatEventDateRange(
                          ev.fecha_inicio,
                          ev.fecha_fin,
                          ev.es_todo_el_dia,
                          eventLocaleKey,
                          t.date.allDayLabel
                        )}
                      </span>
                    </div>

                    {ev.direccion && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 line-clamp-1">
                        <MapPin size={11} />
                        <span>{ev.direccion}</span>
                      </div>
                    )}

                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <Ticket size={12} className="text-emerald-400" />
                      {ev.es_gratuito ? (
                        <span className="text-emerald-300 font-medium">
                          {t.price.free}
                        </span>
                      ) : ev.precio_desde != null ? (
                        <span className="text-slate-300">
                          {t.price.from}{' '}
                          <span className="font-medium">
                            {ev.moneda || ''} {ev.precio_desde}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {t.price.consult}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => openModalFromCard(ev)}
                        className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                      >
                        {t.moreInfo}
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
        {isModalOpen && selectedEvento && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4"
            onClick={closeModal}
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
                      alt={selectedEvento.titulo}
                      src={
                        selectedEvento.imagen_principal ||
                        '/images/placeholders/evento-placeholder.jpg'
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 160px"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] uppercase font-semibold text-emerald-400">
                      {selectedEvento.zona || t.zoneFallback}
                    </p>
                    <h3 className="text-lg font-semibold">
                      {selectedEvento.titulo}
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      {selectedEvento.categoria}
                    </p>

                    {selectedEvento.estrellas &&
                      selectedEvento.estrellas > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-amber-400 text-[12px]">
                            {renderStars(selectedEvento.estrellas)}
                          </span>
                        </div>
                      )}

                    <div className="mt-1 flex items-start gap-2 text-[12px] text-slate-200">
                      <CalendarDays size={14} className="mt-[2px] shrink-0" />
                      <span>
                        {formatEventDateRange(
                          selectedEvento.fecha_inicio,
                          selectedEvento.fecha_fin,
                          selectedEvento.es_todo_el_dia,
                          eventLocaleKey,
                          t.date.allDayLabel
                        )}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[12px]">
                      <Ticket size={14} className="text-emerald-400" />
                      {selectedEvento.es_gratuito ? (
                        <span className="text-emerald-300 font-medium">
                          {t.price.free}
                        </span>
                      ) : selectedEvento.precio_desde != null ? (
                        <span className="text-slate-200">
                          {t.price.from}{' '}
                          <span className="font-semibold">
                            {selectedEvento.moneda || ''}{' '}
                            {selectedEvento.precio_desde}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {t.price.consult}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedEvento.resena && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{t.modal.review}</h4>
                    <p className="text-[12px] text-slate-300 whitespace-pre-line">
                      {selectedEvento.resena}
                    </p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      {t.modal.address}
                    </p>
                    <p className="text-slate-400">
                      {selectedEvento.direccion || t.modal.noData}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      {t.modal.tickets}
                    </p>
                    {selectedEvento.url_entradas ? (
                      <a
                        href={selectedEvento.url_entradas}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all"
                      >
                        {t.modal.ticketsCta}
                      </a>
                    ) : (
                      <p className="text-slate-400">
                        {t.modal.ticketsUnavailable}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botones cierre + favorito */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
                  {/* BOTÓN CERRAR */}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full max-w-[200px] self-center sm:self-auto
               rounded-full border border-slate-700 
               px-3 py-1.5 text-[11px] font-medium text-slate-300 
               hover:bg-slate-800 transition"
                  >
                    {t.modal.close}
                  </button>

                  {/* BOTÓN FAVORITO */}
                  {(() => {
                    const isFavorite = favoriteEventIds.has(
                      Number(selectedEvento.id)
                    )
                    const label = isFavorite
                      ? t.favorite.remove
                      : t.favorite.add

                    return (
                      <button
                        type="button"
                        disabled={favoriteLoading}
                        onClick={() => handleToggleFavorite(selectedEvento)}
                        className={`w-full max-w-[230px] self-center sm:self-auto
          inline-flex items-center justify-center gap-2
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
                          <Loader2 size={14} className="animate-spin" />
                        ) : isFavorite ? (
                          <HeartOff size={14} />
                        ) : (
                          <Heart size={14} className="fill-emerald-500/70" />
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
