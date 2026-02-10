// C:\Users\sacastro\Documents\proyects\arenaapp\arenaapp-front\src\app\(private)\galerias\page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from '@/context/LocaleContext'
import Image from 'next/image'
import { SlidersHorizontal, ChevronDown, MapPin, Instagram } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'

interface Galeria {
  id: number | string
  nombre: string
  slug: string
  descripcion_corta: string | null
  resena: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  pais: string | null
  zona: string | null
  telefono: string | null
  email_contacto: string | null
  sitio_web: string | null
  instagram: string | null
  facebook: string | null
  anio_fundacion: number | null
  tiene_entrada_gratuita: boolean | null
  requiere_reserva: boolean | null
  horario_desde?: string | null
  horario_hasta?: string | null
  url_imagen: string | null
  imagen_principal?: string | null
  estrellas?: number | null
  nombre_muestra?: string | null
  artistas?: string | null
  fecha_inauguracion?: string | null
  hora_inauguracion?: string | null
  url_maps?: string | null
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const PUBLIC_ENDPOINT = `${API_BASE}/api/admin/galerias/public`
const FAVORITOS_GALERIAS_ENDPOINT = `${API_BASE}/api/admin/favoritos/galerias`
const PAGE_SIZE = 12

// 📅 Componente de badge de calendario
function CalendarBadge({ fecha }: { fecha: string | null | undefined }) {
  if (!fecha) return null

  const date = new Date(fecha)
  const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const month = monthNames[date.getMonth()]
  const day = date.getDate()

  return (
    <div className="absolute top-2 left-2 z-10 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 text-center">
        {month}
      </div>
      <div className="bg-white text-slate-900 text-lg font-bold px-2 py-1 text-center leading-none">
        {day}
      </div>
    </div>
  )
}

// Formatear fecha como dd/mm/yyyy
function formatDate(fecha: string | null | undefined): string {
  if (!fecha) return '-'
  const date = new Date(fecha)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// 🏷️ Badge de estado (En Curso / Próximamente)
function StatusBadge({ fecha }: { fecha: string | null | undefined }) {
  if (!fecha) return null
  
  const status = getDateStatus(fecha)
  
  if (status === 'current') {
    return (
      <div className="absolute top-2 right-2 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
        EN CURSO
      </div>
    )
  } else if (status === 'upcoming') {
    return (
      <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
        PRÓXIMAMENTE
      </div>
    )
  }
  
  return null
}

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

// 🗓️ Función para comparar fechas y ordenar
function getDateStatus(fecha: string | null | undefined): 'current' | 'upcoming' | 'past' | 'none' {
  if (!fecha) return 'none'
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const inauguracion = new Date(fecha)
  inauguracion.setHours(0, 0, 0, 0)
  
  // Considerar "current" si la inauguración fue en los últimos 60 días
  const sixtyDaysAgo = new Date(today)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  
  if (inauguracion >= sixtyDaysAgo && inauguracion <= today) {
    return 'current'
  } else if (inauguracion > today) {
    return 'upcoming'
  } else {
    return 'past'
  }
}

function sortByDate(a: Galeria, b: Galeria): number {
  const statusA = getDateStatus(a.fecha_inauguracion)
  const statusB = getDateStatus(b.fecha_inauguracion)
  
  // Orden de prioridad: current > upcoming > past > none
  const priority = { current: 0, upcoming: 1, past: 2, none: 3 }
  
  if (priority[statusA] !== priority[statusB]) {
    return priority[statusA] - priority[statusB]
  }
  
  // Si tienen el mismo status, ordenar por fecha
  if (statusA !== 'none' && statusB !== 'none') {
    const dateA = new Date(a.fecha_inauguracion!).getTime()
    const dateB = new Date(b.fecha_inauguracion!).getTime()
    
    // Para current y past: más reciente primero (descendente)
    // Para upcoming: más próximo primero (ascendente)
    if (statusA === 'upcoming') {
      return dateA - dateB
    } else {
      return dateB - dateA
    }
  }
  
  // Si no tienen fecha, ordenar por nombre
  return a.nombre.localeCompare(b.nombre)
}

/* ---------------- i18n simple (es, en, pt) ---------------- */

const GALERIAS_TEXTS = {
  es: {
    pageTitle: 'Galerías de arte',
    pageSubtitle: 'Espacios culturales, galerías y salas de exposición.',
    loadingPage: 'Cargando...',
    loadingList: 'Cargando galerías...',
    errorDefault: 'Error al cargar galerías.',
    emptyList: 'No se encontraron galerías con los filtros actuales.',
    filters: {
      title: 'Filtros',
      show: 'Mostrar filtros',
      hide: 'Ocultar filtros',
      searchLabel: 'Buscar',
      searchPlaceholder: 'Nombre, zona, ciudad...',
      zoneLabel: 'Zona',
      zoneAll: 'Todas',
    },
    zoneFallback: 'Zona no especificada',
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
      website: 'Sitio web',
      entry: 'Entrada',
      reservation: 'Reserva',
      entryFree: 'Entrada gratuita',
      entryPaid: 'Entrada paga o a confirmar',
      reservationRequired: 'Requiere reserva previa',
      reservationNotRequired: 'Sin reserva obligatoria',
      foundedIn: 'Fundada en',
      close: 'Cerrar',
      noData: '-',
    },
    favorite: {
      add: 'Guardar como favorito',
      remove: 'Quitar de favoritos',
    },
  },
  en: {
    pageTitle: 'Art galleries',
    pageSubtitle: 'Cultural spaces, galleries and exhibition rooms.',
    loadingPage: 'Loading...',
    loadingList: 'Loading galleries...',
    errorDefault: 'Error loading galleries.',
    emptyList: 'No galleries found with the current filters.',
    filters: {
      title: 'Filters',
      show: 'Show filters',
      hide: 'Hide filters',
      searchLabel: 'Search',
      searchPlaceholder: 'Name, area, city...',
      zoneLabel: 'Area',
      zoneAll: 'All',
    },
    zoneFallback: 'Area not specified',
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
      website: 'Website',
      entry: 'Entry',
      reservation: 'Reservation',
      entryFree: 'Free entry',
      entryPaid: 'Paid entry or to be confirmed',
      reservationRequired: 'Reservation required',
      reservationNotRequired: 'No mandatory reservation',
      foundedIn: 'Founded in',
      close: 'Close',
      noData: '-',
    },
    favorite: {
      add: 'Save as favorite',
      remove: 'Remove from favorites',
    },
  },
  pt: {
    pageTitle: 'Galerias de arte',
    pageSubtitle: 'Espaços culturais, galerias e salas de exposição.',
    loadingPage: 'Carregando...',
    loadingList: 'Carregando galerias...',
    errorDefault: 'Erro ao carregar galerias.',
    emptyList: 'Nenhuma galeria encontrada com os filtros atuais.',
    filters: {
      title: 'Filtros',
      show: 'Mostrar filtros',
      hide: 'Ocultar filtros',
      searchLabel: 'Buscar',
      searchPlaceholder: 'Nome, zona, cidade...',
      zoneLabel: 'Zona',
      zoneAll: 'Todas',
    },
    zoneFallback: 'Zona não especificada',
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
      website: 'Site',
      entry: 'Entrada',
      reservation: 'Reserva',
      entryFree: 'Entrada gratuita',
      entryPaid: 'Entrada paga ou a confirmar',
      reservationRequired: 'Requer reserva prévia',
      reservationNotRequired: 'Sem reserva obrigatória',
      foundedIn: 'Fundada em',
      close: 'Fechar',
      noData: '-',
    },
    favorite: {
      add: 'Salvar como favorito',
      remove: 'Remover dos favoritos',
    },
  },
} as const

type Lang = keyof typeof GALERIAS_TEXTS

/* ---------------------------------------------------------- */

export default function GaleriasPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

  const { locale } = useLocale()
  const currentLang: Lang =
    locale === 'en' || locale === 'pt' || locale === 'es' ? locale : 'es'
  const t = GALERIAS_TEXTS[currentLang]
  const apiLang: 'es' | 'en' | 'pt' =
    locale === 'en' ? 'en' : locale === 'pt' ? 'pt' : 'es'

  const galeriaIdParam = searchParams.get('galeriaId')
  const galeriaId = galeriaIdParam ? Number(galeriaIdParam) : null

  const [galerias, setGalerias] = useState<Galeria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedGaleria, setSelectedGaleria] = useState<Galeria | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // filtros
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // favoritos
  const [favoriteGaleriaIds, setFavoriteGaleriaIds] = useState<Set<number>>(
    new Set()
  )
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // 1) Guardia de auth
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const redirectUrl = galeriaId
        ? `/galerias-museos?galeriaId=${galeriaId}`
        : '/galerias-museos'

      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }
  }, [user, isLoading, router, galeriaId])

  // 2) Traer todas las galerías PUBLICADAS
  useEffect(() => {
    if (!user) return

    const fetchGalerias = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${PUBLIC_ENDPOINT}?lang=${apiLang}&t=${Date.now()}`, {
          method: 'GET',
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Galeria[] = await res.json()
        setGalerias(data)
      } catch (err: any) {
        console.error('Error cargando galerías públicas', err)
        setError(err?.message ?? GALERIAS_TEXTS.es.errorDefault)
      } finally {
        setLoading(false)
      }
    }

    fetchGalerias()
  }, [user, apiLang])

  // 3) Traer favoritos de galerías del usuario
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        const headers: HeadersInit = {}
        if (auth?.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }

        const res = await fetch(FAVORITOS_GALERIAS_ENDPOINT, {
          method: 'GET',
          headers,
          credentials: 'include',
        })

        if (!res.ok) {
          console.error(
            'Error cargando favoritos de galerías',
            await res.text()
          )
          return
        }

        const data: any[] = await res.json()
        // query devuelve: favorito_id, galeria_id, g.*
        const ids = data
          .map((row) => Number(row.galeria_id ?? row.id ?? row.item_id))
          .filter((id) => !Number.isNaN(id))

        setFavoriteGaleriaIds(new Set(ids))
      } catch (err) {
        console.error('Error cargando favoritos de galerías', err)
      }
    }

    fetchFavorites()
  }, [user, auth?.token])

  // 4) Si venimos con ?galeriaId=, abrir ese modal cuando ya hay data
  useEffect(() => {
    if (!galerias.length) return
    if (!galeriaId) return

    const found = galerias.find((g) => Number(g.id) === Number(galeriaId))
    if (found) {
      setSelectedGaleria(found)
      setIsModalOpen(true)
    }
  }, [galerias, galeriaId])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedGaleria(null)
    router.push('/galerias-museos')
  }

  const openModalFromCard = (galeria: Galeria) => {
    setSelectedGaleria(galeria)
    setIsModalOpen(true)
    router.push(`/galerias-museos?galeriaId=${galeria.id}`)
  }

  // 5) Opciones dinámicas (zonas)
  const zonas = useMemo(
    () =>
      Array.from(
        new Set(
          galerias
            .map((g) => g.zona)
            .filter((z): z is string => !!z && z.trim().length > 0)
        )
      ).sort(),
    [galerias]
  )

  // 6) Aplicar filtros y ordenar por fecha
  const filteredGalerias = useMemo(() => {
    let result = [...galerias]

    const term = normalizeText(search.trim())
    if (term) {
      result = result.filter((g) => {
        const nombre = normalizeText(g.nombre)
        const zona = normalizeText(g.zona)
        const ciudad = normalizeText(g.ciudad)
        const descripcion = normalizeText(g.descripcion_corta)
        return (
          nombre.includes(term) ||
          zona.includes(term) ||
          ciudad.includes(term) ||
          descripcion.includes(term)
        )
      })
    }

    if (zonaFilter) {
      result = result.filter((g) => g.zona === zonaFilter)
    }

    // Ordenar por fecha: actuales/próximas primero
    result.sort(sortByDate)

    return result
  }, [galerias, search, zonaFilter])

  // Reset a página 1 cuando cambian filtros/búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [search, zonaFilter])

  const totalPages = Math.max(1, Math.ceil(filteredGalerias.length / PAGE_SIZE))

  // Agrupar por mes y año
  const groupedGalerias = useMemo(() => {
    const groups: { [key: string]: Galeria[] } = {}
    
    filteredGalerias.forEach((g) => {
      if (g.fecha_inauguracion) {
        const date = new Date(g.fecha_inauguracion)
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        if (!groups[key]) groups[key] = []
        groups[key].push(g)
      } else {
        const key = 'Sin fecha'
        if (!groups[key]) groups[key] = []
        groups[key].push(g)
      }
    })
    
    return groups
  }, [filteredGalerias])

  const paginatedGalerias = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredGalerias.slice(start, start + PAGE_SIZE)
  }, [filteredGalerias, currentPage])

  // 7) Toggle favorito de galería
  const handleToggleFavorite = async (galeria: Galeria) => {
    if (!galeria?.id) return

    const galeriaIdNumeric = Number(galeria.id)
    if (!galeriaIdNumeric || Number.isNaN(galeriaIdNumeric)) return

    setFavoriteLoading(true)

    try {
      const isFavorite = favoriteGaleriaIds.has(galeriaIdNumeric)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (auth?.token) {
        headers['Authorization'] = `Bearer ${auth.token}`
      }

      const res = await fetch(FAVORITOS_GALERIAS_ENDPOINT, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ galeriaId: galeriaIdNumeric }),
      })

      if (!res.ok) {
        console.error(
          'Error al actualizar favorito de galería',
          await res.text()
        )
        return
      }

      setFavoriteGaleriaIds((prev) => {
        const next = new Set(prev)
        if (isFavorite) {
          next.delete(galeriaIdNumeric)
        } else {
          next.add(galeriaIdNumeric)
        }
        return next
      })
    } catch (err) {
      console.error('Error al actualizar favorito de galería', err)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Buscador */}
              <div>
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
            </div>
          )}
        </section>

        {/* Estado carga/error */}
        {loading && <p className="text-xs text-slate-400">{t.loadingList}</p>}

        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Listado */}
        {!loading && !error && filteredGalerias.length === 0 && (
          <p className="text-xs text-slate-400">{t.emptyList}</p>
        )}

        {!loading && !error && filteredGalerias.length > 0 && (
          <>
            {/* Agrupado por mes y año */}
            <section className="space-y-6">
              {Object.entries(groupedGalerias).map(([monthYear, galerias]) => {
                // Calcular cuántos de este grupo están en la página actual
                const start = (currentPage - 1) * PAGE_SIZE
                const end = start + PAGE_SIZE
                const allGaleriasFlat = filteredGalerias
                const groupStartIndex = allGaleriasFlat.findIndex(g => galerias.includes(g))
                const groupEndIndex = groupStartIndex + galerias.length
                
                // Si este grupo no se solapa con la página actual, no mostrarlo
                if (groupEndIndex <= start || groupStartIndex >= end) return null
                
                // Filtrar solo las galerías de este grupo que están en la página actual
                const visibleGalerias = galerias.filter(g => {
                  const idx = allGaleriasFlat.indexOf(g)
                  return idx >= start && idx < end
                })
                
                if (visibleGalerias.length === 0) return null
                
                return (
                  <div key={monthYear}>
                    {/* Header del grupo */}
                    <h3 className="text-lg font-bold text-slate-200 mb-3 pb-2 border-b border-slate-800">
                      {monthYear}
                    </h3>
                    
                    {/* Grid de galerías */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {visibleGalerias.map((g) => (
                        <div
                          key={g.id}
                          className="rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden"
                        >
                          <div
                            className="relative w-full h-36 sm:h-40 md:h-44 bg-slate-800 cursor-pointer"
                            onClick={() => openModalFromCard(g)}
                          >
                            {/* 📅 Calendar Badge */}
                            <CalendarBadge fecha={g.fecha_inauguracion} />
                            
                            {/* 🏷️ Status Badge */}
                            <StatusBadge fecha={g.fecha_inauguracion} />
                            
                            <Image
                              alt={g.nombre}
                              src={
                                g.url_imagen ||
                                g.imagen_principal ||
                                '/images/placeholders/restaurante-placeholder.jpg'
                              }
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 25vw"
                            />
                          </div>

                          <div className="p-3 flex-1 flex flex-col gap-1 text-[11px]">
                            {/* Zona */}
                            <p className="text-[10px] uppercase font-semibold text-emerald-400">
                              {g.zona || t.zoneFallback}
                            </p>
                            
                            {/* Nombre Muestra - PRIMERO Y MÁS GRANDE */}
                            {g.nombre_muestra ? (
                              <>
                                <h3 className="text-base font-bold line-clamp-2 text-slate-100">
                                  {g.nombre_muestra}
                                </h3>
                                {/* Nombre Galería - SEGUNDO Y MÁS PEQUEÑO */}
                                <p className="text-[11px] font-medium uppercase text-slate-400 line-clamp-1">
                                  {g.nombre}
                                </p>
                              </>
                            ) : (
                              <h3 className="text-sm font-semibold line-clamp-1 uppercase">
                                {g.nombre}
                              </h3>
                            )}

                            {/* Artista */}
                            {g.artistas && (
                              <p className="text-slate-400 line-clamp-1">
                                {g.artistas}
                              </p>
                            )}

                            <div className="mt-auto flex justify-end pt-2">
                              <button
                                type="button"
                                onClick={() => openModalFromCard(g)}
                                className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                              >
                                {t.card.moreInfo}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
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
        {isModalOpen && selectedGaleria && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4"
            onClick={closeModal}
          >
            <div
              className="relative mt-10 mb-6 w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 shadow-xl"
              onClick={(e) => e.stopPropagation()}
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
                      alt={selectedGaleria.nombre}
                      src={
                        selectedGaleria.url_imagen ||
                        selectedGaleria.imagen_principal ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 160px"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] uppercase font-semibold text-emerald-400">
                      {selectedGaleria.zona || t.zoneFallback}
                    </p>
                    <h3 className="text-lg font-semibold uppercase">
                      {selectedGaleria.nombre}
                    </h3>

                    {/* Muestra */}
                    {selectedGaleria.nombre_muestra && (
                        <p className="text-base text-slate-200 font-medium capitalize">
                            {selectedGaleria.nombre_muestra}
                        </p>
                    )}

                    {/* Artista */}
                    {selectedGaleria.artistas && (
                        <p className="text-sm text-slate-400">
                            {selectedGaleria.artistas}
                        </p>
                    )}

                    {/* Fecha y Hora */}
                    {selectedGaleria.fecha_inauguracion && (
                        <p className="text-xs text-slate-500 mt-1">
                            Inauguración: {formatDate(selectedGaleria.fecha_inauguracion)}
                            {selectedGaleria.hora_inauguracion ? ` - ${selectedGaleria.hora_inauguracion.slice(0,5)}` : ''}
                        </p>
                    )}

     {/* Horario Galeria */}
                    {(selectedGaleria.horario_desde || selectedGaleria.horario_hasta) && (
                        <p className="text-xs text-slate-500">
                            Horario galeria: {selectedGaleria.horario_desde?.slice(0,5) || '?'} - {selectedGaleria.horario_hasta?.slice(0,5) || '?'}
                        </p>
                    )}

                    {selectedGaleria.instagram && (
                      <a
                        href={selectedGaleria.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1"
                      >
                        <Instagram size={14} />
                        <span>
                          @
                          {getInstagramHandle(selectedGaleria.instagram)}
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Reseña oculta por pedido usuario */}
                
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      {t.modal.address}
                    </p>
                    <p className="text-slate-400">
                      {selectedGaleria.direccion || t.modal.noData}
                    </p>
                  </div>
                  
                  {/* Como llegar */}
                  {(selectedGaleria.url_maps || selectedGaleria.direccion) && (
                    <div className="space-y-1">
                         <p className="text-xs font-semibold text-slate-300">
                            Cómo llegar
                         </p>
                         <a
                           href={
                             selectedGaleria.url_maps
                               ? selectedGaleria.url_maps
                               : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                   selectedGaleria.direccion + (selectedGaleria.ciudad ? `, ${selectedGaleria.ciudad}` : '')
                                 )}`
                           }
                           target="_blank"
                           rel="noreferrer"
                           className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                         >
                            Ver en mapa
                         </a>
                    </div>
                  )}


                </div>

                {/* Botones cierre + favorito */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                  >
                    {t.modal.close}
                  </button>

                  {(() => {
                    const isFavorite = favoriteGaleriaIds.has(
                      Number(selectedGaleria.id)
                    )

                    const label = isFavorite
                      ? t.favorite.remove
                      : t.favorite.add

                    return (
                      <button
                        type="button"
                        disabled={favoriteLoading}
                        onClick={() => handleToggleFavorite(selectedGaleria)}
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
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}