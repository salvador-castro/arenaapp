'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
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

export default function RestaurantesPage () {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

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
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<Set<number>>(new Set())
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

        const res = await fetch(PUBLIC_ENDPOINT, {
          method: 'GET'
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
  }, [user])

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
          credentials: 'include'
        })

        if (!res.ok) {
          console.error('Error cargando favoritos', await res.text())
          return
        }

        const data: any[] = await res.json()
        const ids = data
          .map(row => Number(row.restaurante_id))
          .filter(id => !Number.isNaN(id))

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

    const found = restaurants.find(r => Number(r.id) === Number(restauranteId))

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
        'Content-Type': 'application/json'
      }
      if (auth?.token) {
        headers['Authorization'] = `Bearer ${auth.token}`
      }

      const res = await fetch(FAVORITOS_RESTAURANTES_ENDPOINT, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ restauranteId })
      })

      if (!res.ok) {
        console.error('Error al actualizar favorito', await res.text())
        return
      }

      setFavoriteRestaurantIds(prev => {
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
            .map(r => r.zona)
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
            .map(r => r.rango_precios)
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
            .map(r => r.tipo_comida)
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
      result = result.filter(r => {
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
      result = result.filter(r => r.zona === zonaFilter)
    }

    if (priceFilter) {
      const priceNumber = Number(priceFilter)
      if (!Number.isNaN(priceNumber)) {
        result = result.filter(r => r.rango_precios === priceNumber)
      }
    }

    if (tiposFilter.length > 0) {
      result = result.filter(
        r => r.tipo_comida && tiposFilter.includes(r.tipo_comida)
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
      <TopNav isLoggedIn={isLoggedIn} />

      <main className='max-w-6xl mx-auto px-4 pt-4 pb-6 space-y-4'>
        {/* Título */}
        <header className='flex flex-col gap-1 mb-1'>
          <h1 className='text-lg font-semibold'>Restaurantes</h1>
          <p className='text-xs text-slate-400'>
            Explorá los lugares recomendados.
          </p>
        </header>

        {/* Filtros */}
        {/* ... (todo lo demás igual a tu versión + el bloque del modal con el botón de favoritos) ... */}
      </main>

      <BottomNav />
    </div>
  )
}
