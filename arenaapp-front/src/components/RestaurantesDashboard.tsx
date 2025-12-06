// src/components/RestaurantesDashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useAuth } from '@/context/AuthContext'
<<<<<<< HEAD
import { Card, CardHeader, CardBody } from '@heroui/react'
import { Instagram } from 'lucide-react'
import Image from 'next/image'
=======
import { Card, CardHeader, CardBody, Image as HeroImage } from '@heroui/react'
>>>>>>> 142e58ec92625e049d64c2baa3f83d65dc7c9450

type Props = {
  isLoggedIn: boolean
}

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

<<<<<<< HEAD
=======
// BASE: dominio del admin (según tu .env)
>>>>>>> 142e58ec92625e049d64c2baa3f83d65dc7c9450
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

// Endpoint que ya tenés en el admin:
// src/app/api/admin/restaurantes/destacados/route.ts
const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/restaurantes/destacados`

export default function RestaurantesDashboard ({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)
  const { auth }: any = useAuth()
  const userRole: string | undefined = auth?.user?.role

  const [places, setPlaces] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

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
<<<<<<< HEAD

=======
>>>>>>> 142e58ec92625e049d64c2baa3f83d65dc7c9450
        const restaurantes: Restaurant[] = Array.isArray(data)
          ? data
          : data.restaurantes ?? []

        const destacados = restaurantes.filter(r => r.es_destacado === true)

        setPlaces(destacados)
      } catch (e: any) {
        console.error('Error cargando restaurantes destacados', e)
        setError('No se pudieron cargar los restaurantes destacados.')
      } finally {
        setLoading(false)
      }
    }

    fetchDestacados()
  }, [])

  const handleMoreInfo = (place: Restaurant) => {
<<<<<<< HEAD
    // si NO está logueado → login con redirect a /restaurantes?restauranteId=ID
    if (!isLoggedIn) {
      const redirectUrl = `/restaurantes?restauranteId=${place.id}`
      goTo(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }

    // si está logueado (user o admin) → solo mostrar modal
    setSelectedPlace(place)
    setIsModalOpen(true)
  }
=======
    // No logueado → register
    if (!isLoggedIn) {
      goTo('/register')
      return
    }

    // Logueado como "user" → /restaurantes con el id del destacado
    if (userRole === 'user') {
      goTo(`/restaurantes?restauranteId=${place.id}`)
      return
    }
>>>>>>> 142e58ec92625e049d64c2baa3f83d65dc7c9450

    // Cualquier otro rol (ej. admin) simplemente va a /restaurantes
    goTo('/restaurantes')
  }

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Restaurantes destacados</h2>

        <button
          type='button'
          className='text-xs font-medium text-emerald-400 underline underline-offset-4 cursor-pointer hover:text-emerald-300'
          onClick={() => goTo('/lugares')}
        >
          Ver más
        </button>
      </div>

      {loading && (
        <p className='text-xs text-slate-400'>Cargando restaurantes...</p>
      )}

      {error && !loading && (
        <p className='text-xs text-red-400'>{error}</p>
      )}

      {!loading && !error && places.length === 0 && (
        <p className='text-xs text-slate-400'>
          Cuando el admin cargue lugares, los vas a ver listados acá.
        </p>
      )}

      {!loading && !error && places.length > 0 && (
        <div className='grid grid-cols-1 gap-3'>
          {places.map(place => (
            <Card
              key={place.id}
              className='bg-slate-900/60 border border-slate-800 overflow-hidden'
            >
              {/* Imagen arriba, full width */}
              <HeroImage
                alt={place.nombre}
                className='w-full h-40 object-cover'
                src={
                  place.url_imagen ||
                  '/images/placeholders/restaurante-placeholder.jpg'
                }
                width={320}
                height={160}
              />

              {/* Texto + botón abajo */}
              <CardHeader className='px-4 py-3 flex items-center justify-between gap-3'>
                <div className='flex flex-col gap-1 min-w-0'>
                  <p className='text-[10px] uppercase font-semibold text-emerald-400 truncate'>
                    {place.zona || 'Zona no especificada'}
                  </p>
                  <h4 className='font-semibold text-sm truncate'>
                    {place.nombre}
                  </h4>
                </div>

                <button
                  type='button'
                  onClick={() => handleMoreInfo(place)}
                  className='shrink-0 inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors'
                >
                  Más info
                </button>
              </CardHeader>
<<<<<<< HEAD

              <CardBody className='overflow-visible py-2 px-4'>
                <div className='flex items-center gap-3'>
                  <div className='relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-800'>
                    <Image
                      alt={place.nombre}
                      src={
                        place.url_imagen ||
                        '/images/placeholders/restaurante-placeholder.jpg'
                      }
                      fill
                      className='object-cover'
                      sizes='96px'
                    />
                  </div>

                  <div className='flex flex-col gap-1 text-[11px]'>
                    <div className='flex items-center gap-2'>
                      <span className='text-amber-400'>
                        {renderStars(place.estrellas)}
                      </span>
                      <span className='text-slate-400'>
                        {renderPriceRange(place.rango_precios)}
                      </span>
                    </div>
                    {place.tipo_comida && (
                      <p className='text-slate-400'>{place.tipo_comida}</p>
                    )}
                    {place.direccion && (
                      <p className='text-slate-500 line-clamp-1'>
                        {place.direccion}
                      </p>
                    )}
                  </div>
                </div>
              </CardBody>
=======
>>>>>>> 142e58ec92625e049d64c2baa3f83d65dc7c9450
            </Card>
          ))}
        </div>
      )}
<<<<<<< HEAD

      {/* Modal de detalle (igual que antes) */}
      {isModalOpen && selectedPlace && (
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
                    alt={selectedPlace.nombre}
                    src={
                      selectedPlace.url_imagen ||
                      '/images/placeholders/restaurante-placeholder.jpg'
                    }
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, 160px'
                  />
                </div>

                <div className='flex-1 space-y-1'>
                  <p className='text-[11px] uppercase font-semibold text-emerald-400'>
                    {selectedPlace.zona || 'Zona no especificada'}
                  </p>
                  <h3 className='text-lg font-semibold'>
                    {selectedPlace.nombre}
                  </h3>
                  <div className='flex flex-wrap items-center gap-2 text-[12px]'>
                    <span className='text-amber-400'>
                      {renderStars(selectedPlace.estrellas)}
                    </span>
                    <span className='text-slate-400'>
                      {renderPriceRange(selectedPlace.rango_precios)}
                    </span>
                    {selectedPlace.tipo_comida && (
                      <span className='rounded-full border border-slate-700 px-2 py-[2px] text-[11px] text-slate-300'>
                        {selectedPlace.tipo_comida}
                      </span>
                    )}
                  </div>

                  {selectedPlace.url_instagram && (
                    <a
                      href={selectedPlace.url_instagram}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1'
                    >
                      <Instagram size={14} />
                      <span>
                        @{getInstagramHandle(selectedPlace.url_instagram)}
                      </span>
                    </a>
                  )}
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
                  {selectedPlace.url_maps && (
                    <a
                      href={selectedPlace.url_maps}
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
                    {selectedPlace.horario_text || '-'}
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
                    Reservas
                  </p>
                  {selectedPlace.url_reservas || selectedPlace.url_reserva ? (
                    <a
                      href={
                        selectedPlace.url_reservas ||
                        selectedPlace.url_reserva ||
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
=======
>>>>>>> 142e58ec92625e049d64c2baa3f83d65dc7c9450
    </section>
  )
}
