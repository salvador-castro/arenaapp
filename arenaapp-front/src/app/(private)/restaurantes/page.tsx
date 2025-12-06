// C:\Users\sacastro\Documents\proyects\arenaapp\arenaapp-front\src\app\(private)\restaurantes\page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import { Instagram } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import UserDropdown from '@/components/UserDropdown'

interface Restaurant {
  id: number
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

export default function RestaurantesPage () {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 👇 misma forma que usás en otros componentes
  const { auth, isLoading }: any = useAuth()
  const user = auth?.user

  const restauranteId = searchParams.get('restauranteId')

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // auth: permite USER y ADMIN, pero obliga a estar logueado
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

  // cargar restaurante por ID (si viene restauranteId en la URL)
  useEffect(() => {
    if (!user) return
    if (!restauranteId) return

    const fetchRestaurant = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(
          `${API_BASE}/api/admin/restaurantes/${restauranteId}`,
          {
            method: 'GET',
            credentials: 'include'
          }
        )

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Restaurant = await res.json()
        setSelectedRestaurant(data)
        setIsModalOpen(true)
      } catch (err: any) {
        console.error('Error cargando restaurante', err)
        setError(err.message ?? 'Error al cargar el restaurante')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [user, restauranteId])

  const closeModal = () => {
    setIsModalOpen(false)
    router.push('/restaurantes')
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
      <header className='sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800'>
        <div className='max-w-4xl mx-auto flex items-center justify-between px-4 py-3'>
          <div>
            <h1 className='text-lg font-semibold'>Restaurantes</h1>
            <p className='text-xs text-slate-400'>
              Explorá los lugares recomendados.
            </p>
          </div>
          <UserDropdown />
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 pt-4 pb-6'>
        <p className='text-xs text-slate-400 mb-4'>
          Próximamente listado completo de restaurantes. Si llegaste desde un
          destacado, vas a ver el detalle abajo.
        </p>

        {loading && (
          <p className='text-xs text-slate-400'>Cargando restaurante...</p>
        )}

        {error && <p className='text-xs text-red-400'>{error}</p>}

        {isModalOpen && selectedRestaurant && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4'>
            <div className='relative w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 shadow-xl'>
              <button
                type='button'
                onClick={closeModal}
                className='absolute right-3 top-3 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700'
              >
                ✕
              </button>

              <div className='p-4 sm:p-6 space-y-4'>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <div className='relative w-full sm:w-40 h-32 sm:h-40 rounded-xl overflow-hidden bg-slate-800'>
                    <Image
                      alt={selectedRestaurant.nombre}
                      src={
                        selectedRestaurant.url_imagen ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 100vw, 160px'
                    />
                  </div>

                  <div className='flex-1 space-y-1'>
                    <p className='text-[11px] uppercase font-semibold text-emerald-400'>
                      {selectedRestaurant.zona || 'Zona no especificada'}
                    </p>
                    <h3 className='text-lg font-semibold'>
                      {selectedRestaurant.nombre}
                    </h3>
                    <div className='flex flex-wrap items-center gap-2 text-[12px]'>
                      <span className='text-amber-400'>
                        {renderStars(selectedRestaurant.estrellas)}
                      </span>
                      <span className='text-slate-400'>
                        {renderPriceRange(selectedRestaurant.rango_precios)}
                      </span>
                      {selectedRestaurant.tipo_comida && (
                        <span className='rounded-full border border-slate-700 px-2 py-[2px] text-[11px] text-slate-300'>
                          {selectedRestaurant.tipo_comida}
                        </span>
                      )}
                    </div>

                    {selectedRestaurant.url_instagram && (
                      <a
                        href={selectedRestaurant.url_instagram}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1'
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
                  <div className='space-y-1'>
                    <h4 className='text-sm font-semibold'>Reseña</h4>
                    <p className='text-[12px] text-slate-300 whitespace-pre-line'>
                      {selectedRestaurant.resena}
                    </p>
                  </div>
                )}

                <div className='grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]'>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Dirección
                    </p>
                    <p className='text-slate-400'>
                      {selectedRestaurant.direccion || '-'}
                    </p>
                    {selectedRestaurant.url_maps && (
                      <a
                        href={selectedRestaurant.url_maps}
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 mt-1 inline-block'
                      >
                        Cómo llegar
                      </a>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Horario
                    </p>
                    <p className='text-slate-400'>
                      {selectedRestaurant.horario_text || '-'}
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Sitio web
                    </p>
                    {selectedRestaurant.sitio_web ? (
                      <a
                        href={selectedRestaurant.sitio_web}
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                      >
                        {selectedRestaurant.sitio_web}
                      </a>
                    ) : (
                      <p className='text-slate-400'>-</p>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-300'>
                      Reservas
                    </p>
                    {selectedRestaurant.url_reservas ||
                    selectedRestaurant.url_reserva ? (
                      <a
                        href={
                          selectedRestaurant.url_reservas ||
                          selectedRestaurant.url_reserva ||
                          '#'
                        }
                        target='_blank'
                        rel='noreferrer'
                        className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                      >
                        Hacer reserva
                      </a>
                    ) : (
                      <p className='text-slate-400'>-</p>
                    )}
                  </div>
                </div>

                <div className='flex justify-end pt-2'>
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
