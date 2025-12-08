'use client'

import { useEffect, useState } from 'react'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useAuth } from '@/context/AuthContext'
import { Instagram } from 'lucide-react'
import Image from 'next/image'

type Props = {
  isLoggedIn: boolean
}

interface Hotel {
  id: number | string
  nombre: string
  slug: string
  descripcion_corta: string | null
  descripcion_larga: string | null
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
  estrellas: number | null
  checkin_desde: string | null
  checkout_hasta: string | null
  precio_noche_desde: number | null
  rango_precio: number | null
  moneda: string | null
  es_destacado: boolean
  imagen_principal: string | null
  url_imagen: string | null
  url_maps: string | null
  url_reservas: string | null
  horario_text: string | null
  meta_title: string | null
  meta_description: string | null
  resena: string | null
  estado: string
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/hoteles/destacados`

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

export default function HotelesDestacados ({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)
  const { auth }: any = useAuth()
  // si después querés usar rol:
  // const userRole: string | undefined = auth?.user?.role

  const [places, setPlaces] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedPlace, setSelectedPlace] = useState<Hotel | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(DESTACADOS_ENDPOINT, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data = await res.json()

        const hoteles: Hotel[] = Array.isArray(data) ? data : data.hoteles ?? []

        // el endpoint ya filtra es_destacado/estado, pero por las dudas:
        const destacados = hoteles.filter(h => h.es_destacado === true)

        setPlaces(destacados)
      } catch (e: any) {
        console.error('Error cargando hoteles destacados', e)
        setError('No se pudieron cargar los hoteles destacados.')
      } finally {
        setLoading(false)
      }
    }

    fetchDestacados()
  }, [])

  const handleMoreInfo = (place: Hotel) => {
    // si NO está logueado → login con redirect a /hoteles?hotelId=ID
    if (!isLoggedIn) {
      const redirectUrl = `/hoteles?hotelId=${place.id}`
      goTo(redirectUrl)
      return
    }

    // si está logueado → mostrar modal local
    setSelectedPlace(place)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPlace(null)
  }

  const topPlaces = places.slice(0, 4)

  return (
    <section className='mt-4 space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between gap-2'>
        <div>
          <h2 className='text-sm font-semibold text-slate-100'>
            Hoteles destacados
          </h2>
          <p className='text-[11px] text-slate-400'>
            Alojamientos recomendados para tu próxima estadía.
          </p>
        </div>

        <button
          type='button'
          className='text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2'
          onClick={() => goTo('/hoteles')}
        >
          Ver todos
        </button>
      </div>

      {loading && (
        <p className='text-xs text-slate-400'>Cargando hoteles destacados...</p>
      )}

      {error && !loading && <p className='text-xs text-red-400'>{error}</p>}

      {!loading && !error && places.length === 0 && (
        <p className='text-xs text-slate-400'>
          Cuando el admin cargue hoteles, los vas a ver listados acá.
        </p>
      )}

      {!loading && !error && topPlaces.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          {topPlaces.map(place => (
            <button
              key={place.id}
              type='button'
              onClick={() => handleMoreInfo(place)}
              className='group text-left rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/70 hover:bg-slate-900 transition-colors flex flex-col overflow-hidden'
            >
              {/* Imagen arriba */}
              <div className='relative w-full h-28 sm:h-32 bg-slate-800'>
                <Image
                  alt={place.nombre}
                  src={
                    place.url_imagen ||
                    place.imagen_principal ||
                    '/images/placeholders/restaurante-placeholder.jpg'
                  }
                  fill
                  className='object-cover group-hover:scale-[1.03] transition-transform'
                  sizes='(max-width: 768px) 100vw, 25vw'
                />
              </div>

              {/* Contenido */}
              <div className='p-3 flex-1 flex flex-col gap-1 text-[11px]'>
                <p className='text-[10px] uppercase font-semibold text-emerald-400'>
                  {place.zona ||
                    place.ciudad ||
                    place.provincia ||
                    'Ubicación no especificada'}
                </p>

                <h3 className='text-sm font-semibold line-clamp-1'>
                  {place.nombre}
                </h3>

                {place.descripcion_corta && (
                  <p className='text-slate-400 line-clamp-2'>
                    {place.descripcion_corta}
                  </p>
                )}

                <div className='mt-1 flex flex-wrap gap-2 text-[10px] text-slate-300'>
                  {typeof place.estrellas === 'number' &&
                    place.estrellas > 0 && (
                      <span className='inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300'>
                        {place.estrellas}★
                      </span>
                    )}

                  {typeof place.precio_noche_desde === 'number' &&
                    place.precio_noche_desde > 0 && (
                      <span className='inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300'>
                        Desde {place.precio_noche_desde} {place.moneda || 'ARS'}{' '}
                        / noche
                      </span>
                    )}
                </div>

                <div className='mt-2 flex justify-end'>
                  <span className='text-[11px] font-medium text-emerald-300 group-hover:text-emerald-200'>
                    Ver más
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      {isModalOpen && selectedPlace && (
        <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4'>
          <div className='relative mt-10 mb-24 w-full max-w-lg max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 shadow-xl'>
            <button
              type='button'
              onClick={closeModal}
              className='sticky top-3 ml-auto mr-3 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700'
            >
              ✕
            </button>

            <div className='px-4 pb-4 pt-1 sm:p-6 space-y-4'>
              <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative w-full sm:w-40 h-32 sm:h-40 rounded-xl overflow-hidden bg-slate-800'>
                  <Image
                    alt={selectedPlace.nombre}
                    src={
                      selectedPlace.url_imagen ||
                      selectedPlace.imagen_principal ||
                      '/images/placeholders/restaurante-placeholder.jpg'
                    }
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, 160px'
                  />
                </div>

                <div className='flex-1 space-y-1'>
                  <p className='text-[11px] uppercase font-semibold text-emerald-400'>
                    {selectedPlace.zona ||
                      selectedPlace.ciudad ||
                      selectedPlace.provincia ||
                      'Ubicación no especificada'}
                  </p>
                  <h3 className='text-lg font-semibold'>
                    {selectedPlace.nombre}
                  </h3>

                  {selectedPlace.instagram && (
                    <a
                      href={selectedPlace.instagram}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1'
                    >
                      <Instagram size={14} />
                      <span>
                        @{getInstagramHandle(selectedPlace.instagram)}
                      </span>
                    </a>
                  )}

                  <div className='flex flex-wrap gap-2 mt-2 text-[11px] text-slate-300'>
                    {typeof selectedPlace.estrellas === 'number' &&
                      selectedPlace.estrellas > 0 && (
                        <span className='inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300'>
                          {selectedPlace.estrellas}★
                        </span>
                      )}

                    {typeof selectedPlace.precio_noche_desde === 'number' &&
                      selectedPlace.precio_noche_desde > 0 && (
                        <span className='inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300'>
                          Desde {selectedPlace.precio_noche_desde}{' '}
                          {selectedPlace.moneda || 'ARS'} / noche
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {selectedPlace.resena && (
                <div className='space-y-1'>
                  <h4 className='text-sm font-semibold'>Reseña</h4>
                  <p className='text-[12px] text-slate-300 whitespace-pre-line'>
                    {selectedPlace.resena}
                  </p>
                </div>
              )}

              <div className='grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]'>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-300'>
                    Dirección
                  </p>
                  <p className='text-slate-400'>
                    {selectedPlace.direccion || '-'}
                  </p>
                </div>

                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-300'>
                    Check-in / Check-out
                  </p>
                  <p className='text-slate-400'>
                    {selectedPlace.checkin_desde || selectedPlace.checkout_hasta
                      ? `${selectedPlace.checkin_desde ?? ''}${
                          selectedPlace.checkin_desde &&
                          selectedPlace.checkout_hasta
                            ? ' · '
                            : ''
                        }${selectedPlace.checkout_hasta ?? ''}`
                      : '-'}
                  </p>
                </div>

                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-300'>
                    Sitio web
                  </p>
                  {selectedPlace.sitio_web ? (
                    <a
                      href={selectedPlace.sitio_web}
                      target='_blank'
                      rel='noreferrer'
                      className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                    >
                      {selectedPlace.sitio_web}
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
                    {selectedPlace.telefono || selectedPlace.email_contacto
                      ? `${selectedPlace.telefono ?? ''}${
                          selectedPlace.telefono && selectedPlace.email_contacto
                            ? ' · '
                            : ''
                        }${selectedPlace.email_contacto ?? ''}`
                      : '-'}
                  </p>
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
    </section>
  )
}
