'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'

type FavoriteTipo =
  | 'RESTAURANTE'
  | 'BAR'
  | 'EVENTO'
  | 'GALERIA'
  | 'HOTEL'
  | 'SHOPPING'

interface FavoriteItem {
  favorito_id: number
  item_id: number
  tipo: FavoriteTipo
  nombre: string
  tipo_comida: string | null
  slug: string
  descripcion_corta: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  zona: string | null
  pais: string | null
  sitio_web: string | null
  rango_precios: number | null
  estrellas: number | null
  url_imagen: string | null
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const FAVORITOS_RESTAURANTES_ENDPOINT = `${API_BASE}/api/admin/favoritos/restaurantes`
const FAVORITOS_BARES_ENDPOINT = `${API_BASE}/api/admin/favoritos/bares`
const FAVORITOS_EVENTOS_ENDPOINT = `${API_BASE}/api/admin/favoritos/eventos`
const FAVORITOS_GALERIAS_ENDPOINT = `${API_BASE}/api/admin/favoritos/galerias`
const FAVORITOS_HOTELES_ENDPOINT = `${API_BASE}/api/admin/favoritos/hoteles`
const FAVORITOS_SHOPPING_ENDPOINT = `${API_BASE}/api/admin/favoritos/shopping`

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

export default function FavoritosPage () {
  const router = useRouter()
  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  // Guardia de auth
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login?redirect=/favoritos')
      return
    }
  }, [user, isLoading, router])

  // helper para headers con Authorization
  function buildAuthHeaders (extra: HeadersInit = {}): HeadersInit {
    const headers: HeadersInit = { ...extra }
    if (auth?.token) {
      headers['Authorization'] = `Bearer ${auth.token}`
    }
    return headers
  }

  // Cargar favoritos (restaurantes + bares + eventos + galerías + hoteles + shopping)
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        setLoading(true)
        setError(null)

        const headers = buildAuthHeaders()

        const [
          resRest,
          resBares,
          resEventos,
          resGalerias,
          resHoteles,
          resShopping
        ] = await Promise.all([
          fetch(FAVORITOS_RESTAURANTES_ENDPOINT, {
            method: 'GET',
            headers,
            credentials: 'include'
          }),
          fetch(FAVORITOS_BARES_ENDPOINT, {
            method: 'GET',
            headers,
            credentials: 'include'
          }),
          fetch(FAVORITOS_EVENTOS_ENDPOINT, {
            method: 'GET',
            headers,
            credentials: 'include'
          }),
          fetch(FAVORITOS_GALERIAS_ENDPOINT, {
            method: 'GET',
            headers,
            credentials: 'include'
          }),
          fetch(FAVORITOS_HOTELES_ENDPOINT, {
            method: 'GET',
            headers,
            credentials: 'include'
          }),
          fetch(FAVORITOS_SHOPPING_ENDPOINT, {
            method: 'GET',
            headers,
            credentials: 'include'
          })
        ])

        if (!resRest.ok) {
          throw new Error(`Error HTTP favoritos restaurantes ${resRest.status}`)
        }
        if (!resBares.ok) {
          throw new Error(`Error HTTP favoritos bares ${resBares.status}`)
        }
        if (!resEventos.ok) {
          throw new Error(`Error HTTP favoritos eventos ${resEventos.status}`)
        }
        if (!resGalerias.ok) {
          throw new Error(`Error HTTP favoritos galerías ${resGalerias.status}`)
        }
        if (!resHoteles.ok) {
          throw new Error(`Error HTTP favoritos hoteles ${resHoteles.status}`)
        }
        if (!resShopping.ok) {
          throw new Error(`Error HTTP favoritos shopping ${resShopping.status}`)
        }

        const dataRest: any[] = await resRest.json()
        const dataBares: any[] = await resBares.json()
        const dataEventos: any[] = await resEventos.json()
        const dataGalerias: any[] = await resGalerias.json()
        const dataHoteles: any[] = await resHoteles.json()
        const dataShopping: any[] = await resShopping.json()

        const mappedRest: FavoriteItem[] = dataRest
          .map(row => ({
            favorito_id: Number(row.favorito_id),
            item_id: Number(row.restaurante_id ?? row.id),
            tipo: 'RESTAURANTE' as const,
            nombre: row.nombre,
            tipo_comida: row.tipo_comida,
            slug: row.slug,
            descripcion_corta: row.descripcion_corta,
            direccion: row.direccion,
            ciudad: row.ciudad,
            provincia: row.provincia,
            zona: row.zona,
            pais: row.pais,
            sitio_web: row.sitio_web,
            rango_precios: row.rango_precios,
            estrellas: row.estrellas,
            url_imagen: row.url_imagen ?? row.imagen_principal ?? null
          }))
          .filter(f => !Number.isNaN(f.item_id))

        const mappedBares: FavoriteItem[] = dataBares
          .map(row => ({
            favorito_id: Number(row.favorito_id),
            item_id: Number(row.bar_id ?? row.id),
            tipo: 'BAR' as const,
            nombre: row.nombre,
            tipo_comida: row.tipo_comida,
            slug: row.slug,
            descripcion_corta: row.descripcion_corta,
            direccion: row.direccion,
            ciudad: row.ciudad,
            provincia: row.provincia,
            zona: row.zona,
            pais: row.pais,
            sitio_web: row.sitio_web,
            rango_precios: row.rango_precios,
            estrellas: row.estrellas,
            url_imagen: row.url_imagen ?? row.imagen_principal ?? null
          }))
          .filter(f => !Number.isNaN(f.item_id))

        const mappedEventos: FavoriteItem[] = dataEventos
          .map(row => ({
            favorito_id: Number(row.favorito_id),
            item_id: Number(row.evento_id ?? row.id),
            tipo: 'EVENTO' as const,
            nombre: row.titulo,
            // uso categoria como "tipo_comida" para reusar el badge
            tipo_comida: row.categoria ?? null,
            slug: row.slug,
            descripcion_corta: row.resena ?? null,
            direccion: row.direccion,
            ciudad: null,
            provincia: null,
            zona: row.zona,
            pais: null,
            sitio_web: row.url_entradas,
            rango_precios: null,
            estrellas: null,
            url_imagen: row.imagen_principal ?? row.url_imagen ?? null
          }))
          .filter(f => !Number.isNaN(f.item_id))

        const mappedGalerias: FavoriteItem[] = dataGalerias
          .map(row => ({
            favorito_id: Number(row.favorito_id),
            item_id: Number(row.galeria_id ?? row.id),
            tipo: 'GALERIA' as const,
            nombre: row.nombre,
            tipo_comida: null,
            slug: row.slug,
            descripcion_corta: row.descripcion_corta ?? row.resena ?? null,
            direccion: row.direccion,
            ciudad: row.ciudad,
            provincia: row.provincia,
            zona: row.zona,
            pais: row.pais,
            sitio_web: row.sitio_web,
            rango_precios: null,
            estrellas: null,
            url_imagen: row.url_imagen ?? row.imagen_principal ?? null
          }))
          .filter(f => !Number.isNaN(f.item_id))

        const mappedHoteles: FavoriteItem[] = dataHoteles
          .map(row => ({
            favorito_id: Number(row.favorito_id),
            item_id: Number(row.hotel_id ?? row.id),
            tipo: 'HOTEL' as const,
            nombre: row.nombre,
            tipo_comida: null,
            slug: row.slug,
            descripcion_corta: row.descripcion_corta ?? row.descripcion_larga,
            direccion: row.direccion,
            ciudad: row.ciudad,
            provincia: row.provincia,
            zona: row.zona,
            pais: row.pais,
            sitio_web: row.sitio_web,
            rango_precios: row.rango_precios ?? null,
            estrellas: row.estrellas ?? null,
            url_imagen: row.url_imagen ?? row.imagen_principal ?? null
          }))
          .filter(f => !Number.isNaN(f.item_id))

        const mappedShopping: FavoriteItem[] = dataShopping
          .map(row => ({
            favorito_id: Number(row.favorito_id),
            item_id: Number(row.shopping_id ?? row.id),
            tipo: 'SHOPPING' as const,
            nombre: row.nombre,
            tipo_comida: null,
            slug: row.slug,
            descripcion_corta: row.descripcion_corta ?? null,
            direccion: row.direccion,
            ciudad: row.ciudad,
            provincia: row.provincia,
            zona: row.zona,
            pais: row.pais,
            sitio_web: row.sitio_web,
            rango_precios: null,
            estrellas: null,
            url_imagen: row.url_imagen ?? row.imagen_principal ?? null
          }))
          .filter(f => !Number.isNaN(f.item_id))

        const combined = [
          ...mappedRest,
          ...mappedBares,
          ...mappedEventos,
          ...mappedGalerias,
          ...mappedHoteles,
          ...mappedShopping
        ].sort((a, b) => b.favorito_id - a.favorito_id)

        setFavorites(combined)
      } catch (err: any) {
        console.error('Error cargando favoritos', err)
        setError(err.message ?? 'Error al cargar favoritos')
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user, auth?.token])

  const handleRemoveFavorite = async (item: FavoriteItem) => {
    const { item_id, tipo } = item
    setRemovingId(item_id)

    try {
      if (tipo === 'RESTAURANTE') {
        const headers = buildAuthHeaders({
          'Content-Type': 'application/json'
        })

        const res = await fetch(FAVORITOS_RESTAURANTES_ENDPOINT, {
          method: 'DELETE',
          headers,
          credentials: 'include',
          body: JSON.stringify({ restauranteId: item_id })
        })

        if (!res.ok) {
          console.error(
            'Error al quitar favorito restaurante',
            await res.text()
          )
          return
        }
      } else if (tipo === 'BAR') {
        const headers = buildAuthHeaders({
          'Content-Type': 'application/json'
        })

        const res = await fetch(FAVORITOS_BARES_ENDPOINT, {
          method: 'DELETE',
          credentials: 'include',
          headers,
          body: JSON.stringify({ barId: item_id })
        })

        if (!res.ok) {
          console.error('Error al quitar favorito bar', await res.text())
          return
        }
      } else if (tipo === 'EVENTO') {
        const headers = buildAuthHeaders({
          'Content-Type': 'application/json'
        })

        const res = await fetch(FAVORITOS_EVENTOS_ENDPOINT, {
          method: 'DELETE',
          headers,
          credentials: 'include',
          body: JSON.stringify({ eventoId: item_id })
        })

        if (!res.ok) {
          console.error('Error al quitar favorito evento', await res.text())
          return
        }
      } else if (tipo === 'GALERIA') {
        const headers = buildAuthHeaders({
          'Content-Type': 'application/json'
        })

        const res = await fetch(FAVORITOS_GALERIAS_ENDPOINT, {
          method: 'DELETE',
          headers,
          credentials: 'include',
          body: JSON.stringify({ galeriaId: item_id }) // ajustá si tu API usa otro nombre
        })

        if (!res.ok) {
          console.error('Error al quitar favorito galería', await res.text())
          return
        }
      } else if (tipo === 'HOTEL') {
        const headers = buildAuthHeaders({
          'Content-Type': 'application/json'
        })

        const res = await fetch(FAVORITOS_HOTELES_ENDPOINT, {
          method: 'DELETE',
          headers,
          credentials: 'include',
          body: JSON.stringify({ hotelId: item_id }) // ajustá si tu API usa otro nombre
        })

        if (!res.ok) {
          console.error('Error al quitar favorito hotel', await res.text())
          return
        }
      } else if (tipo === 'SHOPPING') {
        const headers = buildAuthHeaders({
          'Content-Type': 'application/json'
        })

        const res = await fetch(FAVORITOS_SHOPPING_ENDPOINT, {
          method: 'DELETE',
          headers,
          credentials: 'include',
          body: JSON.stringify({ shoppingId: item_id }) // ajustá si tu API usa otro nombre
        })

        if (!res.ok) {
          console.error('Error al quitar favorito shopping', await res.text())
          return
        }
      }

      setFavorites(prev =>
        prev.filter(f => f.item_id !== item_id || f.tipo !== tipo)
      )
    } catch (err) {
      console.error('Error al quitar favorito', err)
    } finally {
      setRemovingId(null)
    }
  }

  const handleGoToItem = (item: FavoriteItem) => {
    if (item.tipo === 'RESTAURANTE') {
      router.push(`/restaurantes?restauranteId=${item.item_id}`)
    } else if (item.tipo === 'BAR') {
      router.push(`/bares?barId=${item.item_id}`)
    } else if (item.tipo === 'EVENTO') {
      router.push(`/eventos?eventoId=${item.item_id}`)
    } else if (item.tipo === 'GALERIA') {
      router.push(`/galerias?galeriaId=${item.item_id}`)
    } else if (item.tipo === 'HOTEL') {
      router.push(`/hoteles?hotelId=${item.item_id}`)
    } else if (item.tipo === 'SHOPPING') {
      router.push(`/shopping?shoppingId=${item.item_id}`)
    }
  }

  const getTipoLabel = (tipo: FavoriteTipo) => {
    switch (tipo) {
      case 'RESTAURANTE':
        return 'Restaurante'
      case 'BAR':
        return 'Bar'
      case 'EVENTO':
        return 'Evento'
      case 'GALERIA':
        return 'Galería'
      case 'HOTEL':
        return 'Hotel'
      case 'SHOPPING':
        return 'Shopping'
      default:
        return 'Lugar'
    }
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
        <header className='flex flex-col gap-1 mb-1'>
          <h1 className='text-lg font-semibold'>Tus favoritos</h1>
          <p className='text-xs text-slate-400'>
            Lugares que guardaste para volver a ver.
          </p>
        </header>

        {loading && (
          <p className='text-xs text-slate-400'>Cargando favoritos...</p>
        )}

        {error && <p className='text-xs text-red-400'>{error}</p>}

        {!loading && !error && favorites.length === 0 && (
          <p className='text-xs text-slate-400'>
            Todavía no guardaste lugares como favoritos.
          </p>
        )}

        {!loading && !error && favorites.length > 0 && (
          <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {favorites.map(place => (
              <div
                key={`${place.tipo}-${place.favorito_id}`}
                className='rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden'
              >
                <div
                  className='relative w-full h-36 sm:h-40 md:h-44 bg-slate-800 cursor-pointer'
                  onClick={() => handleGoToItem(place)}
                >
                  <Image
                    alt={place.nombre}
                    src={
                      place.url_imagen ||
                      '/images/placeholders/restaurante-placeholder.jpg'
                    }
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 100vw, 25vw'
                  />
                </div>

                <div className='p-3 flex-1 flex flex-col gap-1 text-[11px]'>
                  <div className='flex items-center justify-between'>
                    <p className='text-[10px] uppercase font-semibold text-emerald-400'>
                      {place.zona || 'Zona no especificada'}
                    </p>
                    <span className='text-[9px] uppercase tracking-wide text-slate-500 border border-slate-700 rounded-full px-2 py-[2px]'>
                      {getTipoLabel(place.tipo)}
                    </span>
                  </div>

                  <h3 className='text-sm font-semibold line-clamp-1'>
                    {place.nombre}
                  </h3>

                  {place.descripcion_corta && (
                    <p className='text-slate-400 line-clamp-2'>
                      {place.descripcion_corta}
                    </p>
                  )}

                  {/* Para tipos sin estrellas/rango quedarán en "-" y no rompen el layout */}
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-amber-400'>
                      {renderStars(place.estrellas)}
                    </span>
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

                  <div className='mt-2 flex justify-between gap-2'>
                    <button
                      type='button'
                      onClick={() => handleGoToItem(place)}
                      className='rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors'
                    >
                      Ver detalle
                    </button>

                    <button
                      type='button'
                      onClick={() => handleRemoveFavorite(place)}
                      disabled={removingId === place.item_id}
                      className='rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300 hover:border-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {removingId === place.item_id ? 'Quitando...' : 'Quitar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
