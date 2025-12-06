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

type FavoriteType =
  | 'restaurante'
  | 'galeria'
  | 'hotel'
  | 'shopping'
  | 'evento'
  | 'bar'

interface FavoriteItem {
  id: number
  user_id: number
  entity_id: number
  entity_type: FavoriteType
  nombre: string
  zona: string | null
  url_imagen: string | null
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/restaurantes/destacados`
const FAVORITOS_ENDPOINT = `${API_BASE}/api/favoritos`

export default function DashboardPage () {
  const { user, isLoading }: any = useAuth()
  const isLoggedIn = !isLoading && !!user
  const { goTo } = useAuthRedirect(isLoggedIn)

  const [places, setPlaces] = useState<Restaurant[]>([])
  const [loadingDestacados, setLoadingDestacados] = useState<boolean>(false)
  const [errorDestacados, setErrorDestacados] = useState<string | null>(null)

  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(false)
  const [errorFavorites, setErrorFavorites] = useState<string | null>(null)

  // ---------------------------
  // Restaurantes destacados
  // ---------------------------
  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        setLoadingDestacados(true)
        setErrorDestacados(null)

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
        setErrorDestacados('No se pudieron cargar los restaurantes destacados.')
      } finally {
        setLoadingDestacados(false)
      }
    }

    fetchDestacados()
  }, [])

  // ---------------------------
  // Mis favoritos
  // ---------------------------
  useEffect(() => {
    if (!isLoggedIn) return

    const fetchFavorites = async () => {
      try {
        setLoadingFavorites(true)
        setErrorFavorites(null)

        const res = await fetch(FAVORITOS_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // asumiendo sesión vía cookie
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data = await res.json()

        // Asumo que la API devuelve { favoritos: [...] } o un array directo
        const favoritos: FavoriteItem[] = Array.isArray(data)
          ? data
          : data.favoritos ?? []

        setFavorites(favoritos)
      } catch (e: any) {
        console.error('Error cargando favoritos', e)
        setErrorFavorites('No se pudieron cargar tus favoritos.')
      } finally {
        setLoadingFavorites(false)
      }
    }

    fetchFavorites()
  }, [isLoggedIn])

  const handleMoreInfoRestaurant = (place: Restaurant) => {
    // siempre usamos goTo con la ruta PROTEGIDA
    goTo(`/restaurantes?restauranteId=${place.id}`)
  }

  const handleFavoriteClick = (fav: FavoriteItem) => {
    // Mapeo por tipo a su ruta y query param
    const map: Record<FavoriteType, { path: string; param: string }> = {
      restaurante: { path: '/restaurantes', param: 'restauranteId' },
      galeria: { path: '/galeria', param: 'galeriaId' },
      hotel: { path: '/hoteles', param: 'hotelId' },
      shopping: { path: '/shopping', param: 'shoppingId' },
      evento: { path: '/eventos', param: 'eventoId' },
      bar: { path: '/bares', param: 'barId' }
    }

    const config = map[fav.entity_type]
    const url = `${config.path}?${config.param}=${fav.entity_id}`
    goTo(url)
  }

  const handleGoToSection = (path: string) => {
    goTo(path)
  }

  const firstName = user?.nombre ?? user?.firstName ?? ''

  return (
    <section className='space-y-6'>
      {/* Header con saludo */}
      <header className='flex flex-col gap-1'>
        <p className='text-xs text-slate-400'>
          Bienvenido{firstName ? `, ${firstName}` : ''} 👋
        </p>
        <h1 className='text-xl font-semibold'>
          ¿Qué te gustaría explorar hoy?
        </h1>
      </header>

      {/* MIS FAVORITOS */}
      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Mis favoritos</h2>

          {/* Si luego creás una página de favoritos, podés usar /favoritos */}
          {/* <button
            type='button'
            onClick={() => goTo('/favoritos')}
            className='text-xs font-medium text-emerald-400 underline underline-offset-4 hover:text-emerald-300'
          >
            Ver todos
          </button> */}
        </div>

        {loadingFavorites && (
          <p className='text-xs text-slate-400'>Cargando tus favoritos...</p>
        )}

        {errorFavorites && !loadingFavorites && (
          <p className='text-xs text-red-400'>{errorFavorites}</p>
        )}

        {!loadingFavorites && !errorFavorites && favorites.length === 0 && (
          <p className='text-xs text-slate-400'>
            Todavía no tenés lugares favoritos. Cuando marques restaurantes,
            galerías, hoteles, eventos o bares como favoritos, van a aparecer
            acá.
          </p>
        )}

        {!loadingFavorites && !errorFavorites && favorites.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {favorites.slice(0, 4).map(fav => (
              <Card
                key={`${fav.entity_type}-${fav.id}`}
                isPressable
                onPress={() => handleFavoriteClick(fav)}
                className='bg-slate-900/60 border border-slate-800 overflow-hidden cursor-pointer'
              >
                {fav.url_imagen && (
                  <HeroImage
                    alt={fav.nombre}
                    className='w-full h-32 object-cover'
                    src={fav.url_imagen}
                    width={320}
                    height={128}
                  />
                )}

                <CardHeader className='px-4 py-3 flex items-center justify-between gap-3'>
                  <div className='flex flex-col gap-1 min-w-0'>
                    <p className='text-[10px] uppercase font-semibold text-emerald-400 truncate'>
                      {fav.entity_type.toUpperCase()}
                      {fav.zona ? ` · ${fav.zona}` : ''}
                    </p>
                    <h4 className='font-semibold text-sm truncate'>
                      {fav.nombre}
                    </h4>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* RESTAURANTES DESTACADOS */}
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

        {loadingDestacados && (
          <p className='text-xs text-slate-400'>Cargando restaurantes...</p>
        )}

        {errorDestacados && !loadingDestacados && (
          <p className='text-xs text-red-400'>{errorDestacados}</p>
        )}

        {!loadingDestacados && !errorDestacados && places.length === 0 && (
          <p className='text-xs text-slate-400'>
            Cuando el admin cargue lugares, los vas a ver listados acá.
          </p>
        )}

        {!loadingDestacados && !errorDestacados && places.length > 0 && (
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
                    onClick={() => handleMoreInfoRestaurant(place)}
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

      {/* ACCESOS RÁPIDOS A SECCIONES */}
      <section className='space-y-3 pb-16'>
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
