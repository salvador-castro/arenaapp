'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'

type FavoriteTipo = 'RESTAURANTE' | 'BAR' | 'EVENTO'

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

  // Cargar favoritos (restaurantes + bares + eventos)
  useEffect(() => {
    if (!user) return

    const fetchFavorites = async () => {
      try {
        setLoading(true)
        setError(null)

        const headers: HeadersInit = {}
        if (auth?.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }

        const [resRest, resBares, resEventos] = await Promise.all([
          fetch(FAVORITOS_RESTAURANTES_ENDPOINT, {
            method: 'GET',
            headers,
            credentials: 'include'
          }),
          fetch(FAVORITOS_BARES_ENDPOINT, {
            method: 'GET',
            credentials: 'include'
          }),
          fetch(FAVORITOS_EVENTOS_ENDPOINT, {
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

        const dataRest: any[] = await resRest.json()
        const dataBares: any[] = await resBares.json()
        const dataEventos: any[] = await resEventos.json()

        const mappedRest: FavoriteItem[] = dataRest
          .map(row => ({
            favorito_id: Number(row.favorito_id),
            item_id: Number(row.restaurante_id),
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
            url_imagen: row.url_imagen
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
            url_imagen: row.url_imagen ?? row.imagen_principal
          }))
          .filter(f => !Number.isNaN(f.item_id))

        const mappedEventos: FavoriteItem[] = dataEventos
          .map(row => ({
            favorito_id: Number(row.favorito_id),
            item_id: Number(row.evento_id),
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
            // para eventos no usamos el rango de precios tipo $$$, lo dejo null
            rango_precios: null,
            estrellas: null,
            url_imagen: row.imagen_principal
          }))
          .filter(f => !Number.isNaN(f.item_id))

        // combinados, ordenados por favorito_id desc (aprox por fecha)
        const combined = [...mappedRest, ...mappedBares, ...mappedEventos].sort(
          (a, b) => b.favorito_id - a.favorito_id
        )

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
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        }
        if (auth?.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }

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
        const res = await fetch(FAVORITOS_BARES_ENDPOINT, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ barId: item_id })
        })

        if (!res.ok) {
          console.error('Error al quitar favorito bar', await res.text())
          return
        }
      } else {
        // EVENTO
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        }
        if (auth?.token) {
          headers['Authorization'] = `Bearer ${auth.token}`
        }

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
    } else {
      router.push(`/eventos?eventoId=${item.item_id}`)
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
                      {place.tipo === 'RESTAURANTE'
                        ? 'Restaurante'
                        : place.tipo === 'BAR'
                        ? 'Bar'
                        : 'Evento'}
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

                  {/* Para eventos estrellas/rango quedarán en "-" y no rompen el layout */}
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
