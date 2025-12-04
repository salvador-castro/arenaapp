// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\src\components\RestaurantesDashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useAuth } from '@/context/AuthContext'
import { Card, CardHeader, CardBody, Image as HeroImage } from '@heroui/react'
import { Instagram } from 'lucide-react'

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

// Ajustá el endpoint según tu backend
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/restaurantes/destacados`

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

export default function RestaurantesDashboard ({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)
  const { auth }: any = useAuth() // cast a any para no pelear con los tipos que ya tengas
  const userRole: string | undefined = auth?.user?.role

  const [places, setPlaces] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedPlace, setSelectedPlace] = useState<Restaurant | null>(null)
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

        // Adaptá esto según cómo responda tu API:
        // - si la API devuelve { restaurantes: [...] }
        // - o si devuelve directamente [...]
        const restaurantes: Restaurant[] = Array.isArray(data)
          ? data
          : data.restaurantes ?? []

        // Filtro de seguridad por si el endpoint no filtra es_destacado
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
    // Solo usuarios logueados con rol 'user' pueden ver el modal
    if (!isLoggedIn || userRole !== 'user') {
      // Podés cambiar la ruta si tu login está en otro path
      goTo('/login')
      return
    }

    setSelectedPlace(place)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPlace(null)
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

      {error && !loading && <p className='text-xs text-red-400'>{error}</p>}

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
              className='py-3 bg-slate-900/60 border border-slate-800'
            >
              <CardHeader className='pb-0 pt-2 px-4 flex w-full items-start justify-between gap-2'>
                <div className='flex flex-col gap-1'>
                  <p className='text-[10px] uppercase font-semibold text-emerald-400'>
                    {place.zona || 'Zona no especificada'}
                  </p>
                  <h4 className='font-semibold text-sm line-clamp-1'>
                    {place.nombre}
                  </h4>
                  {place.descripcion_corta && (
                    <p className='text-[11px] text-slate-400 line-clamp-2'>
                      {place.descripcion_corta}
                    </p>
                  )}
                </div>

                <button
                  type='button'
                  onClick={() => handleMoreInfo(place)}
                  className='ml-auto inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors'
                >
                  Más info
                </button>
              </CardHeader>

              <CardBody className='overflow-visible py-2 px-4'>
                <div className='flex items-center gap-3'>
                  <HeroImage
                    alt={place.nombre}
                    className='object-cover rounded-xl w-24 h-24 shrink-0'
                    src={
                      place.url_imagen ||
                      '/images/placeholders/restaurante-placeholder.jpg'
                    }
                    width={96}
                    height={96}
                  />

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
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      {isModalOpen && selectedPlace && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4'>
          <div className='relative w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 shadow-xl'>
            {/* Cerrar */}
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
                  alt={selectedPlace.nombre}
                  className='object-cover rounded-xl w-full sm:w-40 h-32 sm:h-40'
                  src={
                    selectedPlace.url_imagen ||
                    '/images/placeholders/restaurante-placeholder.jpg'
                  }
                  width={160}
                  height={160}
                />

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

              {/* Reseña */}
              {selectedPlace.resena && (
                <div className='space-y-1'>
                  <h4 className='text-sm font-semibold'>Reseña</h4>
                  <p className='text-[12px] text-slate-300 whitespace-pre-line'>
                    {selectedPlace.resena}
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

              {/* Footer */}
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
