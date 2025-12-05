// src/app/(private)/restaurantes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Image as HeroImage } from '@heroui/react'
import { Instagram } from 'lucide-react'

interface RestaurantDetail {
  id: number
  nombre: string
  tipo_comida: string | null
  descripcion_larga: string | null
  direccion: string | null
  url_maps: string | null
  horario_text: string | null
  zona: string | null
  sitio_web: string | null
  rango_precios: number | null
  estrellas: number | null
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
  const searchParams = useSearchParams()
  const { auth }: any = useAuth()

  const [selected, setSelected] = useState<RestaurantDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const restauranteId = searchParams.get('restauranteId')

  useEffect(() => {
    const fetchDetail = async () => {
      if (!restauranteId) return

      try {
        setLoadingDetail(true)

        // Endpoint admin protegido: /api/admin/restaurantes/:id
        const res = await fetch(
          `${API_BASE}/api/admin/restaurantes/${restauranteId}`,
          {
            headers: {
              'Content-Type': 'application/json'
              // si usás cookies httpOnly para el token, podés necesitar:
              // credentials: 'include'
            }
          }
        )

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: RestaurantDetail = await res.json()
        setSelected(data)
        setIsModalOpen(true)
      } catch (err) {
        console.error('Error al cargar detalle de restaurante', err)
      } finally {
        setLoadingDetail(false)
      }
    }

    fetchDetail()
  }, [restauranteId])

  const closeModal = () => {
    setIsModalOpen(false)
    setSelected(null)
    // Opcional: limpiar el query param usando history.replaceState
  }

  return (
    <>
      {/* Acá va TU contenido normal de /restaurantes (listados, filtros, etc.) */}

      {loadingDetail && (
        <p className='text-xs text-slate-400 mt-4'>
          Cargando detalle del restaurante...
        </p>
      )}

      {isModalOpen && selected && (
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
              {/* Encabezado */}
              <div className='flex flex-col sm:flex-row gap-4'>
                <HeroImage
                  alt={selected.nombre}
                  className='object-cover rounded-xl w-full sm:w-40 h-32 sm:h-40'
                  src={
                    selected.url_imagen ||
                    '/images/placeholders/restaurante-placeholder.jpg'
                  }
                  width={160}
                  height={160}
                />

                <div className='flex-1 space-y-1'>
                  <p className='text-[11px] uppercase font-semibold text-emerald-400'>
                    {selected.zona || 'Zona no especificada'}
                  </p>
                  <h3 className='text-lg font-semibold'>
                    {selected.nombre}
                  </h3>
                  <div className='flex flex-wrap items-center gap-2 text-[12px]'>
                    <span className='text-amber-400'>
                      {renderStars(selected.estrellas)}
                    </span>
                    <span className='text-slate-400'>
                      {renderPriceRange(selected.rango_precios)}
                    </span>
                    {selected.tipo_comida && (
                      <span className='rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300'>
                        {selected.tipo_comida}
                      </span>
                    )}
                  </div>

                  {selected.url_instagram && (
                    <a
                      href={selected.url_instagram}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1'
                    >
                      <Instagram size={14} />
                      <span>
                        @{getInstagramHandle(selected.url_instagram)}
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Reseña */}
              {selected.resena && (
                <div className='space-y-1'>
                  <h4 className='text-sm font-semibold'>Reseña</h4>
                  <p className='text-[12px] text-slate-300 whitespace-pre-line'>
                    {selected.resena}
                  </p>
                </div>
              )}

              {/* Datos prácticos */}
              <div className='grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]'>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-300'>
                    Dirección
                  </p>
                  <p className='text-slate-400'>
                    {selected.direccion || '-'}
                  </p>
                  {selected.url_maps && (
                    <a
                      href={selected.url_maps}
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
                    {selected.horario_text || '-'}
                  </p>
                </div>

                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-300'>
                    Sitio web
                  </p>
                  {selected.sitio_web ? (
                    <a
                      href={selected.sitio_web}
                      target='_blank'
                      rel='noreferrer'
                      className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                    >
                      {selected.sitio_web}
                    </a>
                  ) : (
                    <p className='text-slate-400'>-</p>
                  )}
                </div>

                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-300'>
                    Reservas
                  </p>
                  {selected.url_reservas || selected.url_reserva ? (
                    <a
                      href={
                        selected.url_reservas ||
                        selected.url_reserva ||
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
    </>
  )
}
