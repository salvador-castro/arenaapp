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
    goTo(`/restaurantes?restauranteId=${place.id}`)
  }

  const handleGoToSection = (path: string) => {
    goTo(path)
  }

  const firstName = user?.nombre ?? user?.firstName ?? ''

  return (
    <section className='px-4 pt-4 pb-20 max-w-3xl mx-auto space-y-6'>
      {/* Saludo */}
      <header className='flex flex-col gap-1'>
        <p className='text-xs text-slate-400'>
          Bienvenido{firstName ? `, ${firstName}` : ''} 👋
        </p>
        <h1 className='text-xl font-semibold'>
          ¿Qué te gustaría explorar hoy?
        </h1>
      </header>

      {/* Bloque corto con acceso a favoritos */}
      <section className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h2 className='text-sm font-semibold text-slate-100'>
            Tu experiencia
          </h2>
          <button
            type='button'
            onClick={() => goTo('/favoritos')}
            className='text-xs font-medium text-emerald-400 underline underline-offset-4 hover:text-emerald-300'
          >
            Ver favoritos
          </button>
        </div>
        <p className='text-xs text-slate-400'>
          Guardá tus lugares preferidos desde cada ficha y accedé a todos juntos
          en la sección de favoritos.
        </p>
      </section>

      {/* Restaurantes destacados */}
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
          <div className='flex gap-3 overflow-x-auto pb-1'>
            {places.map(place => (
              <Card
                key={place.id}
                className='min-w-[220px] max-w-[260px] bg-slate-900/60 border border-slate-800 overflow-hidden'
              >
                <HeroImage
                  alt={place.nombre}
                  className='w-full h-32 object-cover'
                  src={
                    place.url_imagen ||
                    '/images/placeholders/restaurante-placeholder.jpg'
                  }
                  width={260}
                  height={128}
                />

                <CardHeader className='px-4 py-3 flex flex-col gap-2'>
                  <div className='flex flex-col gap-1 min-w-0'>
                    <p className='text-[10px] uppercase font-semibold text-emerald-400 truncate'>
                      {place.zona || 'Zona no especificada'}
                    </p>
                    <h4 className='font-semibold text-sm truncate'>
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
                    className='self-start inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors'
                  >
                    Más info
                  </button>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Explorá por categoría */}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold'>Explorá por categoría</h2>
        <p className='text-xs text-slate-400'>
          Entrá directo a la sección que quieras descubrir.
        </p>

        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
          <button
            type='button'
            onClick={() => handleGoToSection('/restaurantes')}
            className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
          >
            <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
              Comer
            </p>
            <p className='text-sm font-semibold'>Restaurantes</p>
            <p className='text-[11px] text-slate-400 mt-1'>
              Cocina local, internacional y más.
            </p>
          </button>

          <button
            type='button'
            onClick={() => handleGoToSection('/galeria')}
            className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
          >
            <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
              Arte
            </p>
            <p className='text-sm font-semibold'>Galerías</p>
            <p className='text-[11px] text-slate-400 mt-1'>
              Exhibiciones, muestras y cultura visual.
            </p>
          </button>

          <button
            type='button'
            onClick={() => handleGoToSection('/hoteles')}
            className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
          >
            <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
              Hospedaje
            </p>
            <p className='text-sm font-semibold'>Hoteles</p>
            <p className='text-[11px] text-slate-400 mt-1'>
              Descansá en los mejores alojamientos.
            </p>
          </button>

          <button
            type='button'
            onClick={() => handleGoToSection('/shopping')}
            className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
          >
            <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
              Compras
            </p>
            <p className='text-sm font-semibold'>Shopping</p>
            <p className='text-[11px] text-slate-400 mt-1'>
              Centros comerciales y paseos de compras.
            </p>
          </button>

          <button
            type='button'
            onClick={() => handleGoToSection('/eventos')}
            className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
          >
            <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
              Agenda
            </p>
            <p className='text-sm font-semibold'>Eventos</p>
            <p className='text-[11px] text-slate-400 mt-1'>
              Qué hacer hoy, mañana o el finde.
            </p>
          </button>

          <button
            type='button'
            onClick={() => handleGoToSection('/bares')}
            className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
          >
            <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
              Noche
            </p>
            <p className='text-sm font-semibold'>Bares</p>
            <p className='text-[11px] text-slate-400 mt-1'>
              Cocktails, vino y buena música.
            </p>
          </button>
        </div>
      </section>
    </section>
  )
}
