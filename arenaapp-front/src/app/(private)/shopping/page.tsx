// /Users/salvacastro/Desktop/arenaapp/arenaapp-front/src/app/(private)/shopping/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import {
  Instagram,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  Film,
  ShoppingBag,
  ParkingCircle,
} from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'

interface Shopping {
  id: number | string
  slug: string
  nombre: string
  rango_precios: number | null
  estrellas: number | null
  zona: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  pais: string | null
  horario_text: string | null
  sitio_web: string | null
  url_imagen: string | null
  cantidad_locales: number | null
  tiene_estacionamiento: boolean | null
  tiene_patio_comidas: boolean | null
  tiene_cine: boolean | null
  es_outlet: boolean | null
  es_destacado: boolean
  telefono: string | null
  instagram: string | null
  facebook: string | null
  estado: string
  resena: string | null
}

type YesNoFilter = '' | 'SI' | 'NO'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const PUBLIC_ENDPOINT = `${API_BASE}/api/admin/shopping/public`
const FAVORITOS_SHOPPING_ENDPOINT = `${API_BASE}/api/admin/favoritos/shopping`
const PAGE_SIZE = 12

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

function formatPriceRange(n: number | null): string {
  if (n == null || n <= 0) return '-'
  if (n > 5) return '$$$$$'
  return '$'.repeat(n)
}

function formatStars(n: number | null): string {
  if (n == null || n <= 0) return '-'
  if (n > 5) n = 5
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

export default function ShoppingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

  const shoppingIdParam = searchParams.get('shoppingId')
  const shoppingId = shoppingIdParam ? Number(shoppingIdParam) : null

  const [shoppings, setShoppings] = useState<Shopping[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedShopping, setSelectedShopping] = useState<Shopping | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtros
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [outletFilter, setOutletFilter] = useState<YesNoFilter>('')
  const [cineFilter, setCineFilter] = useState<YesNoFilter>('')
  const [estacionamientoFilter, setEstacionamientoFilter] =
    useState<YesNoFilter>('')

  const [currentPage, setCurrentPage] = useState(1)

  // Favoritos
  const [favoriteShoppingIds, setFavoriteShoppingIds] = useState<Set<number>>(
    new Set()
  )
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // Guardia de auth
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const redirectUrl = shoppingId
        ? `/shopping?shoppingId=${shoppingId}`
        : '/shopping'

      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }
  }, [user, isLoading, router, shoppingId])

  // Traer shoppings PUBLICADOS
  useEffect(() => {
    if (!user) return

    const fetchShoppings = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(PUBLIC_ENDPOINT, {
          method: 'GET',
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Shopping[] = await res.json()
        setShoppings(data)
      } catch (err: any) {
        console.error('Error cargando shoppings públicos', err)
        setError(err.message ?? 'Error al cargar shoppings')
      } finally {
        setLoading(false)
      }
    }

    fetchShoppings()
  }, [user])

  // Traer shoppings favoritos del usuario
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        const headers: HeadersInit = {}
        if (auth?.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }

        const res = await fetch(FAVORITOS_SHOPPING_ENDPOINT, {
          method: 'GET',
          headers,
          credentials: 'include',
        })

        if (!res.ok) {
          console.error(
            'Error cargando favoritos de shoppings',
            await res.text()
          )
          return
        }

        const data: any[] = await res.json()
        const ids = data
          .map((row) => Number(row.shopping_id))
          .filter((id) => !Number.isNaN(id))

        setFavoriteShoppingIds(new Set(ids))
      } catch (err) {
        console.error('Error cargando favoritos de shoppings', err)
      }
    }

    fetchFavorites()
  }, [user, auth?.token])

  // Toggle favorito shopping
  const handleToggleFavorite = async (shopping: Shopping) => {
    if (!shopping?.id) return

    const shoppingIdNum = Number(shopping.id)
    if (!shoppingIdNum || Number.isNaN(shoppingIdNum)) return

    setFavoriteLoading(true)

    try {
      const isFavorite = favoriteShoppingIds.has(shoppingIdNum)

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (auth?.token) {
        headers['Authorization'] = `Bearer ${auth.token}`
      }

      const res = await fetch(FAVORITOS_SHOPPING_ENDPOINT, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ shoppingId: shoppingIdNum }),
      })

      if (!res.ok) {
        console.error(
          'Error al actualizar favorito de shopping',
          await res.text()
        )
        return
      }

      setFavoriteShoppingIds((prev) => {
        const next = new Set(prev)
        if (isFavorite) {
          next.delete(shoppingIdNum)
        } else {
          next.add(shoppingIdNum)
        }
        return next
      })
    } catch (err) {
      console.error('Error al actualizar favorito de shopping', err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  // Si venimos con ?shoppingId=, abrir modal cuando haya data
  useEffect(() => {
    if (!shoppings.length) return
    if (!shoppingId) return

    const found = shoppings.find((s) => Number(s.id) === Number(shoppingId))

    if (found) {
      setSelectedShopping(found)
      setIsModalOpen(true)
    }
  }, [shoppings, shoppingId])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedShopping(null)
    router.push('/shopping')
  }

  const openModalFromCard = (shopping: Shopping) => {
    setSelectedShopping(shopping)
    setIsModalOpen(true)
    router.push(`/shopping?shoppingId=${shopping.id}`)
  }

  // Opciones dinámicas para zonas
  const zonas = useMemo(
    () =>
      Array.from(
        new Set(
          shoppings
            .map((s) => s.zona)
            .filter((z): z is string => !!z && z.trim().length > 0)
        )
      ).sort(),
    [shoppings]
  )

  // Aplicar filtros
  const filteredShoppings = useMemo(() => {
    let result = [...shoppings]

    const term = normalizeText(search.trim())
    if (term) {
      result = result.filter((s) => {
        const nombre = normalizeText(s.nombre)
        const ciudad = normalizeText(s.ciudad)
        const provincia = normalizeText(s.provincia)
        const zona = normalizeText(s.zona)
        return (
          nombre.includes(term) ||
          ciudad.includes(term) ||
          provincia.includes(term) ||
          zona.includes(term)
        )
      })
    }

    if (zonaFilter) {
      result = result.filter((s) => s.zona === zonaFilter)
    }

    if (outletFilter) {
      const flag = outletFilter === 'SI'
      result = result.filter((s) => s.es_outlet === flag)
    }

    if (cineFilter) {
      const flag = cineFilter === 'SI'
      result = result.filter((s) => s.tiene_cine === flag)
    }

    if (estacionamientoFilter) {
      const flag = estacionamientoFilter === 'SI'
      result = result.filter((s) => s.tiene_estacionamiento === flag)
    }

    // Orden: destacados primero, luego por nombre
    result.sort((a, b) => {
      if (a.es_destacado && !b.es_destacado) return -1
      if (!a.es_destacado && b.es_destacado) return 1
      return a.nombre.localeCompare(b.nombre)
    })

    return result
  }, [
    shoppings,
    search,
    zonaFilter,
    outletFilter,
    cineFilter,
    estacionamientoFilter,
  ])

  // reset paginación al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [search, zonaFilter, outletFilter, cineFilter, estacionamientoFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredShoppings.length / PAGE_SIZE)
  )

  const paginatedShoppings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredShoppings.slice(start, start + PAGE_SIZE)
  }, [filteredShoppings, currentPage])

  if (isLoading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <TopNav isLoggedIn={isLoggedIn} />

      <main className="max-w-6xl mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Título */}
        <header className="flex flex-col gap-1 mb-1">
          <h1 className="text-lg font-semibold">Shoppings y outlets</h1>
          <p className="text-xs text-slate-400">
            Encontrá centros comerciales, outlets y paseos de compras.
          </p>
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
              <span>Filtros</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Buscador */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Buscar
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nombre, ciudad, provincia..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Zona */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Zona
                  </label>
                  <select
                    value={zonaFilter}
                    onChange={(e) => setZonaFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Todas</option>
                    {zonas.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Es outlet */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Es outlet
                  </label>
                  <select
                    value={outletFilter}
                    onChange={(e) =>
                      setOutletFilter(e.target.value as YesNoFilter)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Todos</option>
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tiene cine */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Tiene cine
                  </label>
                  <select
                    value={cineFilter}
                    onChange={(e) =>
                      setCineFilter(e.target.value as YesNoFilter)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Todos</option>
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </select>
                </div>

                {/* Estacionamiento */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Tiene estacionamiento
                  </label>
                  <select
                    value={estacionamientoFilter}
                    onChange={(e) =>
                      setEstacionamientoFilter(e.target.value as YesNoFilter)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Todos</option>
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Estado de carga / error */}
        {loading && (
          <p className="text-xs text-slate-400">Cargando shoppings...</p>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Listado */}
        {!loading && !error && filteredShoppings.length === 0 && (
          <p className="text-xs text-slate-400">
            No se encontraron shoppings con los filtros actuales.
          </p>
        )}

        {!loading && !error && filteredShoppings.length > 0 && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedShoppings.map((shopping) => (
                <div
                  key={shopping.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden"
                >
                  <div className="relative w-full h-36 sm:h-40 md:h-44 bg-slate-800">
                    <Image
                      alt={shopping.nombre}
                      src={
                        shopping.url_imagen ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>

                  <div className="p-3 flex-1 flex flex-col gap-1 text-[11px]">
                    <p className="text-[10px] uppercase font-semibold text-emerald-400">
                      {shopping.zona ||
                        shopping.ciudad ||
                        shopping.provincia ||
                        'Ubicación no especificada'}
                    </p>

                    <h3 className="text-sm font-semibold line-clamp-1">
                      {shopping.nombre}
                    </h3>

                    {shopping.resena && (
                      <p className="text-slate-400 line-clamp-2">
                        {shopping.resena}
                      </p>
                    )}

                    {shopping.direccion && (
                      <p className="mt-1 text-[10px] text-slate-500 line-clamp-1 flex items-center gap-1">
                        <MapPin size={11} className="shrink-0" />
                        {shopping.direccion}
                      </p>
                    )}

                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-300">
                      {shopping.rango_precios != null && (
                        <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px]">
                          {formatPriceRange(shopping.rango_precios)}
                        </span>
                      )}
                      {shopping.estrellas != null && (
                        <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px]">
                          {formatStars(shopping.estrellas)}
                        </span>
                      )}
                      {shopping.es_outlet && (
                        <span className="inline-flex rounded-full border border-emerald-500/60 px-2 py-[2px] text-[10px] text-emerald-300">
                          Outlet
                        </span>
                      )}
                      {shopping.tiene_cine && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                          <Film size={10} />
                          Cine
                        </span>
                      )}
                      {shopping.tiene_patio_comidas && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                          <ShoppingBag size={10} />
                          Patio de comidas
                        </span>
                      )}
                      {shopping.tiene_estacionamiento && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                          <ParkingCircle size={10} />
                          Estacionamiento
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => openModalFromCard(shopping)}
                        className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
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
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-full border border-slate-700 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/70"
                >
                  Anterior
                </button>
                <span className="text-[11px] text-slate-400">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-full border border-slate-700 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/70"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {/* MODAL detalle */}
        {isModalOpen && selectedShopping && (
          <div
            className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4"
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
                      alt={selectedShopping.nombre}
                      src={
                        selectedShopping.url_imagen ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 160px"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] uppercase font-semibold text-emerald-400">
                      {selectedShopping.zona ||
                        selectedShopping.ciudad ||
                        selectedShopping.provincia ||
                        'Ubicación no especificada'}
                    </p>
                    <h3 className="text-lg font-semibold">
                      {selectedShopping.nombre}
                    </h3>

                    {selectedShopping.instagram && (
                      <a
                        href={selectedShopping.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1"
                      >
                        <Instagram size={14} />
                        <span>
                          @{getInstagramHandle(selectedShopping.instagram)}
                        </span>
                      </a>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-slate-300">
                      {selectedShopping.rango_precios != null && (
                        <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px]">
                          {formatPriceRange(selectedShopping.rango_precios)}
                        </span>
                      )}
                      {selectedShopping.estrellas != null && (
                        <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px]">
                          {formatStars(selectedShopping.estrellas)}
                        </span>
                      )}
                      {selectedShopping.es_outlet && (
                        <span className="inline-flex rounded-full border border-emerald-500/60 px-2 py-[2px] text-[10px] text-emerald-300">
                          Outlet
                        </span>
                      )}
                      {selectedShopping.tiene_cine && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                          <Film size={10} />
                          Cine
                        </span>
                      )}
                      {selectedShopping.tiene_patio_comidas && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                          <ShoppingBag size={10} />
                          Patio de comidas
                        </span>
                      )}
                      {selectedShopping.tiene_estacionamiento && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                          <ParkingCircle size={10} />
                          Estacionamiento
                        </span>
                      )}
                      {selectedShopping.cantidad_locales != null && (
                        <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                          {selectedShopping.cantidad_locales} locales
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedShopping.resena && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Reseña</h4>
                    <p className="text-[12px] text-slate-300 whitespace-pre-line text-justify md:text-left">
                      {selectedShopping.resena}
                    </p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      Dirección
                    </p>
                    <p className="text-slate-400">
                      {selectedShopping.direccion || '-'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      Horario
                    </p>
                    <p className="text-slate-400">
                      {selectedShopping.horario_text || '-'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      Sitio web
                    </p>
                    {selectedShopping.sitio_web ? (
                      <a
                        href={selectedShopping.sitio_web}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all"
                      >
                        {selectedShopping.sitio_web}
                      </a>
                    ) : (
                      <p className="text-slate-400">-</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      Contacto
                    </p>
                    <p className="text-slate-400">
                      {selectedShopping.telefono || selectedShopping.facebook
                        ? `${selectedShopping.telefono ?? ''}${
                            selectedShopping.telefono &&
                            selectedShopping.facebook
                              ? ' · '
                              : ''
                          }${selectedShopping.facebook ?? ''}`
                        : '-'}
                    </p>
                  </div>
                </div>

                {selectedShopping && (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                    >
                      Cerrar
                    </button>

                    {(() => {
                      const isFavorite = favoriteShoppingIds.has(
                        Number(selectedShopping.id)
                      )

                      return (
                        <button
                          type="button"
                          disabled={favoriteLoading}
                          onClick={() => handleToggleFavorite(selectedShopping)}
                          className={`rounded-full px-4 py-1.5 text-xs font-medium flex items-center gap-1 transition
                            ${
                              isFavorite
                                ? 'border border-emerald-400 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'border border-slate-700 text-slate-200 hover:border-emerald-400 hover:bg-slate-800'
                            }
                          `}
                        >
                          {isFavorite
                            ? 'Quitar de favoritos'
                            : 'Guardar como favorito'}
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
