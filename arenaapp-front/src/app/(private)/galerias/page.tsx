// /Users/salvacastro/Desktop/arenaapp/arenaapp-front/src/app/(private)/galerias/page.tsx
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
  Heart
} from 'lucide-react'
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
  lat: number | null
  lng: number | null
  telefono: string | null
  email_contacto: string | null
  sitio_web: string | null
  instagram: string | null
  facebook: string | null
  anio_fundacion: number | null
  tiene_entrada_gratuita: boolean | null
  requiere_reserva: boolean | null
  horario_desde: string | null
  horario_hasta: string | null
  url_imagen: string | null
  es_destacado: boolean
  estado: string
}

// 🔠 tipo auxiliar para los selects SI/NO
type YesNoFilter = '' | 'SI' | 'NO'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const PUBLIC_ENDPOINT = `${API_BASE}/api/admin/galerias/public`
const FAVORITOS_ENDPOINT = `${API_BASE}/api/admin/favoritos/galerias`
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

export default function GaleriasPage () {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user: ctxUser, auth, isLoading }: any = useAuth()
  const user = ctxUser || auth?.user || null
  const isLoggedIn = !isLoading && !!user

  const galeriaIdParam = searchParams.get('galeriaId')
  const galeriaId = galeriaIdParam ? Number(galeriaIdParam) : null

  const [galerias, setGalerias] = useState<Galeria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedGaleria, setSelectedGaleria] = useState<Galeria | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filtros
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [zonaFilter, setZonaFilter] = useState('')
  const [entradaGratisFilter, setEntradaGratisFilter] =
    useState<YesNoFilter>('')
  const [requiereReservaFilter, setRequiereReservaFilter] =
    useState<YesNoFilter>('')

  const [currentPage, setCurrentPage] = useState(1)

  // ⭐ Favoritos
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])
  const [favLoadingId, setFavLoadingId] = useState<number | null>(null)
  const [favError, setFavError] = useState<string | null>(null)

  const token: string =
    auth?.accessToken || auth?.token || auth?.access_token || ''

  const isFavorite = (id: number | string) => favoriteIds.includes(Number(id))

  // Guardia de auth (igual que restaurantes)
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const redirectUrl = galeriaId
        ? `/galerias?galeriaId=${galeriaId}`
        : '/galerias'

      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }
  }, [user, isLoading, router, galeriaId])

  // Traer galerías PUBLICADAS
  useEffect(() => {
    if (!user) return

    const fetchGalerias = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(PUBLIC_ENDPOINT, {
          method: 'GET'
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Galeria[] = await res.json()
        setGalerias(data)
      } catch (err: any) {
        console.error('Error cargando galerías públicas', err)
        setError(err.message ?? 'Error al cargar galerías')
      } finally {
        setLoading(false)
      }
    }

    fetchGalerias()
  }, [user])

  // Traer favoritos de galerías del usuario
  useEffect(() => {
    if (!user || !token) return

    const fetchFavoritos = async () => {
      try {
        setFavError(null)
        const res = await fetch(FAVORITOS_ENDPOINT, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: { item_id: number }[] = await res.json()

        setFavoriteIds(data.map(f => Number(f.item_id)))
      } catch (err: any) {
        console.error('Error cargando favoritos de galerías', err)
        setFavError(err.message ?? 'Error al cargar favoritos')
      }
    }

    fetchFavoritos()
  }, [user, token])

  // Si venimos con ?galeriaId=, abrir modal cuando haya data
  useEffect(() => {
    if (!galerias.length) return
    if (!galeriaId) return

    const found = galerias.find(g => Number(g.id) === Number(galeriaId))

    if (found) {
      setSelectedGaleria(found)
      setIsModalOpen(true)
    }
  }, [galerias, galeriaId])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedGaleria(null)
    router.push('/galerias')
  }

  const openModalFromCard = (galeria: Galeria) => {
    setSelectedGaleria(galeria)
    setIsModalOpen(true)
    router.push(`/galerias?galeriaId=${galeria.id}`)
  }

  const handleToggleFavorite = async (galeria: Galeria) => {
    if (!token) return
    try {
      setFavError(null)
      setFavLoadingId(Number(galeria.id))

      const res = await fetch(FAVORITOS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ galeriaId: galeria.id })
      })

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`)
      }

      const data: { isFavorite: boolean } = await res.json()

      setFavoriteIds(prev => {
        const idNum = Number(galeria.id)
        if (data.isFavorite) {
          if (prev.includes(idNum)) return prev
          return [...prev, idNum]
        } else {
          return prev.filter(id => id !== idNum)
        }
      })
    } catch (err: any) {
      console.error('Error al toggle favorito de galería', err)
      setFavError(err.message ?? 'Error al guardar favorito')
    } finally {
      setFavLoadingId(null)
    }
  }

  // Opciones dinámicas para filtros
  const zonas = useMemo(
    () =>
      Array.from(
        new Set(
          galerias
            .map(g => g.zona)
            .filter((z): z is string => !!z && z.trim().length > 0)
        )
      ).sort(),
    [galerias]
  )

  // Aplicar filtros
  const filteredGalerias = useMemo(() => {
    let result = [...galerias]

    const term = normalizeText(search.trim())
    if (term) {
      result = result.filter(g => {
        const nombre = normalizeText(g.nombre)
        const ciudad = normalizeText(g.ciudad)
        const provincia = normalizeText(g.provincia)
        const zona = normalizeText(g.zona)
        return (
          nombre.includes(term) ||
          ciudad.includes(term) ||
          provincia.includes(term) ||
          zona.includes(term)
        )
      })
    }

    if (zonaFilter) {
      result = result.filter(g => g.zona === zonaFilter)
    }

    if (entradaGratisFilter) {
      const flag = entradaGratisFilter === 'SI'
      result = result.filter(
        g =>
          g.tiene_entrada_gratuita === flag ||
          (g.tiene_entrada_gratuita === null && flag === false)
      )
    }

    if (requiereReservaFilter) {
      const flag = requiereReservaFilter === 'SI'
      result = result.filter(
        g =>
          g.requiere_reserva === flag ||
          (g.requiere_reserva === null && flag === false)
      )
    }

    // Primero destacados, luego por nombre
    result.sort((a, b) => {
      if (a.es_destacado && !b.es_destacado) return -1
      if (!a.es_destacado && b.es_destacado) return 1
      return a.nombre.localeCompare(b.nombre)
    })

    return result
  }, [galerias, search, zonaFilter, entradaGratisFilter, requiereReservaFilter])

  // reset paginación al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [search, zonaFilter, entradaGratisFilter, requiereReservaFilter])

  const totalPages = Math.max(1, Math.ceil(filteredGalerias.length / PAGE_SIZE))

  const paginatedGalerias = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredGalerias.slice(start, start + PAGE_SIZE)
  }, [filteredGalerias, currentPage])

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
          <h1 className='text-lg font-semibold'>Galerías</h1>
          <p className='text-xs text-slate-400'>
            Descubrí galerías de arte y espacios culturales.
          </p>
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
              <span>Filtros</span>
            </span>
            <span className='flex items-center gap-1 text-[11px] text-emerald-400'>
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
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                {/* Buscador */}
                <div>
                  <label className='block text-[11px] font-medium text-slate-300 mb-1'>
                    Buscar
                  </label>
                  <input
                    type='text'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder='Nombre, ciudad, provincia...'
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  />
                </div>

                {/* Zona */}
                <div>
                  <label className='block text-[11px] font-medium text-slate-300 mb-1'>
                    Zona
                  </label>
                  <select
                    value={zonaFilter}
                    onChange={e => setZonaFilter(e.target.value)}
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  >
                    <option value=''>Todas</option>
                    {zonas.map(z => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Entrada gratuita */}
                <div>
                  <label className='block text-[11px] font-medium text-slate-300 mb-1'>
                    Entrada gratuita
                  </label>
                  <select
                    value={entradaGratisFilter}
                    onChange={e =>
                      setEntradaGratisFilter(e.target.value as YesNoFilter)
                    }
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  >
                    <option value=''>Todas</option>
                    <option value='SI'>Sí</option>
                    <option value='NO'>No</option>
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                {/* Requiere reserva */}
                <div>
                  <label className='block text-[11px] font-medium text-slate-300 mb-1'>
                    Requiere reserva
                  </label>
                  <select
                    value={requiereReservaFilter}
                    onChange={e =>
                      setRequiereReservaFilter(e.target.value as YesNoFilter)
                    }
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  >
                    <option value=''>Todas</option>
                    <option value='SI'>Sí</option>
                    <option value='NO'>No</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Estado de carga / error */}
        {loading && (
          <p className='text-xs text-slate-400'>Cargando galerías...</p>
        )}

        {error && <p className='text-xs text-red-400'>{error}</p>}

        {favError && <p className='text-xs text-red-400'>{favError}</p>}

        {/* Listado */}
        {!loading && !error && filteredGalerias.length === 0 && (
          <p className='text-xs text-slate-400'>
            No se encontraron galerías con los filtros actuales.
          </p>
        )}

        {!loading && !error && filteredGalerias.length > 0 && (
          <>
            <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {paginatedGalerias.map(galeria => (
                <div
                  key={galeria.id}
                  className='rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 transition-colors flex flex-col overflow-hidden'
                >
                  <div className='relative w-full h-36 sm:h-40 md:h-44 bg-slate-800'>
                    <Image
                      alt={galeria.nombre}
                      src={
                        galeria.url_imagen ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className='object-cover'
                      sizes='(max-width: 768px) 100vw, 25vw'
                    />

                    {/* Botón favoritos */}
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation()
                        handleToggleFavorite(galeria)
                      }}
                      className='absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-slate-950/70 border border-slate-700 p-1.5 hover:bg-slate-900/90 transition'
                      disabled={favLoadingId === Number(galeria.id)}
                    >
                      <Heart
                        size={16}
                        className={
                          isFavorite(galeria.id)
                            ? 'text-emerald-400 fill-emerald-400'
                            : 'text-slate-200'
                        }
                      />
                    </button>
                  </div>

                  <div className='p-3 flex-1 flex flex-col gap-1 text-[11px]'>
                    <p className='text-[10px] uppercase font-semibold text-emerald-400'>
                      {galeria.zona ||
                        galeria.ciudad ||
                        galeria.provincia ||
                        'Ubicación no especificada'}
                    </p>

                    <h3 className='text-sm font-semibold line-clamp-1'>
                      {galeria.nombre}
                    </h3>

                    {galeria.descripcion_corta && (
                      <p className='text-slate-400 line-clamp-2'>
                        {galeria.descripcion_corta}
                      </p>
                    )}

                    {galeria.direccion && (
                      <p className='mt-1 text-[10px] text-slate-500 line-clamp-1 flex items-center gap-1'>
                        <MapPin size={11} className='shrink-0' />
                        {galeria.direccion}
                      </p>
                    )}

                    <div className='mt-1 flex flex-wrap gap-2 text-[10px] text-slate-300'>
                      {galeria.tiene_entrada_gratuita && (
                        <span className='inline-flex rounded-full border border-emerald-500/60 px-2 py-[2px] text-[10px] text-emerald-300'>
                          Entrada gratuita
                        </span>
                      )}
                      {galeria.requiere_reserva && (
                        <span className='inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300'>
                          Requiere reserva
                        </span>
                      )}
                    </div>

                    <div className='mt-2 flex justify-end'>
                      <button
                        type='button'
                        onClick={() => openModalFromCard(galeria)}
                        className='rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors'
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
              <div className='flex items-center justify-center gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className='px-3 py-1.5 rounded-full border border-slate-700 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/70'
                >
                  Anterior
                </button>
                <span className='text-[11px] text-slate-400'>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  type='button'
                  onClick={() =>
                    setCurrentPage(p => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className='px-3 py-1.5 rounded-full border border-slate-700 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800/70'
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {/* MODAL detalle */}
        {isModalOpen && selectedGaleria && (
          <div
            className='fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4'
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
                      alt={selectedGaleria.nombre}
                      src={
                        selectedGaleria.url_imagen ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 100vw, 160px'
                    />
                  </div>

                  <div className='flex-1 space-y-1'>
                    <p className='text-[11px] uppercase font-semibold text-emerald-400'>
                      {selectedGaleria.zona ||
                        selectedGaleria.ciudad ||
                        selectedGaleria.provincia ||
                        'Ubicación no especificada'}
                    </p>
                    <h3 className='text-lg font-semibold'>
                      {selectedGaleria.nombre}
                    </h3>

                    {selectedGaleria.instagram && (
                      <a
                        href={selectedGaleria.instagram}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1'
                      >
                        <Instagram size={14} />
                        <span>
                          @{getInstagramHandle(selectedGaleria.instagram)}
                        </span>
                      </a>
                    )}

                    <div className='flex flex-wrap gap-2 mt-2 text-[11px] text-slate-300'>
                      {selectedGaleria.tiene_entrada_gratuita && (
                        <span className='inline-flex rounded-full border border-emerald-500/60 px-2 py-[2px] text-[10px] text-emerald-300'>
                          Entrada gratuita
                        </span>
                      )}
                      {selectedGaleria.requiere_reserva && (
                        <span className='inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300'>
                          Requiere reserva
                        </span>
                      )}
                      {selectedGaleria.anio_fundacion && (
                        <span className='inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300'>
                          Fundada en {selectedGaleria.anio_fundacion}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedGaleria.resena && (
                  <div className='space-y-1'>
                    <h4 className='text-sm font-semibold'>Reseña</h4>
                    <p className='text-[12px] text-slate-300 whitespace-pre-line'>
                      {selectedGaleria.resena}
                    </p>
                  </div>
                )}

                <div className='grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]'>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Dirección
                    </p>
                    <p className='text-slate-400'>
                      {selectedGaleria.direccion || '-'}
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Horario
                    </p>
                    <p className='text-slate-400'>
                      {selectedGaleria.horario_desde ||
                      selectedGaleria.horario_hasta
                        ? `${selectedGaleria.horario_desde ?? ''}${
                            selectedGaleria.horario_desde &&
                            selectedGaleria.horario_hasta
                              ? ' - '
                              : ''
                          }${selectedGaleria.horario_hasta ?? ''}`
                        : '-'}
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Sitio web
                    </p>
                    {selectedGaleria.sitio_web ? (
                      <a
                        href={selectedGaleria.sitio_web}
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                      >
                        {selectedGaleria.sitio_web}
                      </a>
                    ) : (
                      <p className='text-slate-400'>-</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Contacto
                    </p>
                    <p className='text-slate-400'>
                      {selectedGaleria.telefono ||
                      selectedGaleria.email_contacto
                        ? `${selectedGaleria.telefono ?? ''}${
                            selectedGaleria.telefono &&
                            selectedGaleria.email_contacto
                              ? ' · '
                              : ''
                          }${selectedGaleria.email_contacto ?? ''}`
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className='flex justify-between items-center pt-2 gap-2'>
                  <button
                    type='button'
                    onClick={() => handleToggleFavorite(selectedGaleria)}
                    className='inline-flex items-center gap-2 rounded-full border border-emerald-500/60 px-4 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50'
                    disabled={favLoadingId === Number(selectedGaleria.id)}
                  >
                    <Heart
                      size={14}
                      className={
                        isFavorite(selectedGaleria.id)
                          ? 'text-emerald-400 fill-emerald-400'
                          : 'text-emerald-300'
                      }
                    />
                    {isFavorite(selectedGaleria.id)
                      ? 'Quitar de favoritos'
                      : 'Guardar en favoritos'}
                  </button>

                  <button
                    type='button'
                    onClick={closeModal}
                    className='rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800'
                  >
                    Cerrar
                  </button>
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
