'use client'

import { useEffect, useState } from 'react'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useAuth } from '@/context/AuthContext'
import { Card, CardHeader, Image as HeroImage } from '@heroui/react'

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

const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/restaurantes/destacados`

export default function DashboardPage () {
  const { user, isLoading }: any = useAuth()
  const isLoggedIn = !isLoading && !!user
  const { goTo } = useAuthRedirect(isLoggedIn)

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
    // siempre usamos goTo con la ruta PROTEGIDA
    goTo(`/restaurantes?restauranteId=${place.id}`)
  }

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Restaurantes destacados</h2>

        <button
          type='button'
          className='text-xs font-medium text-emerald-400 underline underline-offset-4 cursor-pointer hover:text-emerald-300'
          onClick={() => goTo('/restaurantes')}
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
              className='bg-slate-900/60 border border-slate-800 overflow-hidden'
            >
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
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
