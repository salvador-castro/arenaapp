// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\src\components\RestaurantesDestacados.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useAuth } from '@/context/AuthContext'
import { Instagram } from 'lucide-react'
import Image from 'next/image'
import { useLocale } from '@/context/LocaleContext'

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

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/restaurantes/destacados`

function renderPriceRange(rango: number | null | undefined): string {
  if (!rango || rango < 1) return '-'
  const value = Math.min(Math.max(rango, 1), 5)
  return '$'.repeat(value)
}

function renderStars(estrellas: number | null | undefined): string {
  if (!estrellas || estrellas < 1) return '-'
  const value = Math.min(Math.max(estrellas, 1), 5)
  return '★'.repeat(value)
}

function getInstagramHandle(url: string | null): string {
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

export default function RestaurantesDestacados({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)
  const { auth }: any = useAuth()
  const userRole: string | undefined = auth?.user?.role // por ahora se mantiene aunque no se use

  const { locale } = useLocale()

  const [places, setPlaces] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedPlace, setSelectedPlace] = useState<Restaurant | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const t = {
    es: {
      sectionTitle: 'Restaurantes destacados',
      sectionSubtitle: 'Elegidos por su propuesta gastronómica y experiencia.',
      seeAll: 'Ver todos',
      loading: 'Cargando restaurantes destacados...',
      error: 'No se pudieron cargar los restaurantes destacados.',
      empty: 'Cuando el admin cargue lugares, los vas a ver listados acá.',
      zoneFallback: 'Zona no especificada',
      seeMore: 'Ver más',
      reviewTitle: 'Reseña',
      addressLabel: 'Dirección',
      howToGetThere: 'Cómo llegar',
      scheduleLabel: 'Horario',
      websiteLabel: 'Sitio web',
      bookingsLabel: 'Reservas',
      makeBooking: 'Hacer reserva',
      close: 'Cerrar',
    },
    en: {
      sectionTitle: 'Featured restaurants',
      sectionSubtitle: 'Selected for their food and overall experience.',
      seeAll: 'See all',
      loading: 'Loading featured restaurants...',
      error: 'Could not load featured restaurants.',
      empty: 'Once the admin adds places, you will see them listed here.',
      zoneFallback: 'Zone not specified',
      seeMore: 'See more',
      reviewTitle: 'Review',
      addressLabel: 'Address',
      howToGetThere: 'Get directions',
      scheduleLabel: 'Opening hours',
      websiteLabel: 'Website',
      bookingsLabel: 'Bookings',
      makeBooking: 'Make a reservation',
      close: 'Close',
    },
    pt: {
      sectionTitle: 'Restaurantes em destaque',
      sectionSubtitle: 'Escolhidos pela proposta gastronômica e experiência.',
      seeAll: 'Ver todos',
      loading: 'Carregando restaurantes em destaque...',
      error: 'Não foi possível carregar os restaurantes em destaque.',
      empty: 'Quando o admin cadastrar lugares, você verá a lista aqui.',
      zoneFallback: 'Zona não especificada',
      seeMore: 'Ver mais',
      reviewTitle: 'Resenha',
      addressLabel: 'Endereço',
      howToGetThere: 'Como chegar',
      scheduleLabel: 'Horário',
      websiteLabel: 'Site',
      bookingsLabel: 'Reservas',
      makeBooking: 'Fazer reserva',
      close: 'Fechar',
    },
  }[locale]

  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(DESTACADOS_ENDPOINT, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data = await res.json()

        const restaurantes: Restaurant[] = Array.isArray(data)
          ? data
          : (data.restaurantes ?? [])

        const destacados = restaurantes.filter((r) => r.es_destacado === true)

        setPlaces(destacados)
      } catch (e: any) {
        console.error('Error cargando restaurantes destacados', e)
        // guardamos algo en error solo para el estado; el texto visible viene de t.error
        setError('LOAD_ERROR')
      } finally {
        setLoading(false)
      }
    }

    fetchDestacados()
  }, [])

  const handleMoreInfo = (place: Restaurant) => {
    // si NO está logueado → login con redirect a /restaurantes?restauranteId=ID
    if (!isLoggedIn) {
      const redirectUrl = `/restaurantes?restauranteId=${place.id}`

      goTo(redirectUrl)
      return
    }

    // si está logueado (user o admin) → solo mostrar modal
    setSelectedPlace(place)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPlace(null)
  }

  const topPlaces = places.slice(0, 4)

  return (
    <section className="mt-4 space-y-3">
      {/* Header igual al de BaresDestacados */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            {t.sectionTitle}
          </h2>
          <p className="text-[11px] text-slate-400">{t.sectionSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => goTo('/restaurantes')}
          className="
    inline-flex items-center gap-1
    rounded-full
    border border-emerald-500/60
    bg-emerald-500/10
    px-4 py-1.5
    text-xs font-semibold text-emerald-300
    hover:bg-emerald-500/20 hover:border-emerald-400
    transition-colors
  "
        >
          {t.seeAll}
          <span aria-hidden>→</span>
        </button>
      </div>

      {loading && <p className="text-xs text-slate-400">{t.loading}</p>}

      {error && !loading && <p className="text-xs text-red-400">{t.error}</p>}

      {!loading && !error && places.length === 0 && (
        <p className="text-xs text-slate-400">{t.empty}</p>
      )}

      {!loading && !error && topPlaces.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topPlaces.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => handleMoreInfo(place)}
              className="group text-left rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/70 hover:bg-slate-900 transition-colors flex flex-col overflow-hidden"
            >
              {/* Imagen arriba */}
              <div className="relative w-full h-28 sm:h-32 bg-slate-800">
                <Image
                  alt={place.nombre}
                  src={
                    place.url_imagen ||
                    '/images/placeholders/restaurante-placeholder.jpg'
                  }
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>

              {/* Contenido */}
              <div className="p-3 flex-1 flex flex-col gap-1 text-[11px]">
                <p className="text-[10px] uppercase font-semibold text-emerald-400">
                  {place.zona || place.ciudad || t.zoneFallback}
                </p>
                <h3 className="text-sm font-semibold line-clamp-1">
                  {place.nombre}
                </h3>

                {place.descripcion_corta && (
                  <p className="text-slate-400 line-clamp-2">
                    {place.descripcion_corta}
                  </p>
                )}

                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-300">
                  {place.estrellas && place.estrellas > 0 && (
                    <span className="inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300">
                      {place.estrellas}★
                    </span>
                  )}
                  {place.rango_precios && place.rango_precios > 0 && (
                    <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                      {renderPriceRange(place.rango_precios)}
                    </span>
                  )}
                  {place.tipo_comida && (
                    <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                      {place.tipo_comida}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex justify-end">
                  <span className="text-[11px] font-medium text-emerald-300 group-hover:text-emerald-200">
                    {t.seeMore}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      {isModalOpen && selectedPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-3 top-3 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
            >
              ✕
            </button>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-40 h-32 sm:h-40 rounded-xl overflow-hidden bg-slate-800">
                  <Image
                    alt={selectedPlace.nombre}
                    src={
                      selectedPlace.url_imagen ||
                      '/images/placeholders/restaurante-placeholder.jpg'
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 160px"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-[11px] uppercase font-semibold text-emerald-400">
                    {selectedPlace.zona || t.zoneFallback}
                  </p>
                  <h3 className="text-lg font-semibold">
                    {selectedPlace.nombre}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-slate-300">
                    {selectedPlace.estrellas && selectedPlace.estrellas > 0 && (
                      <span className="inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300">
                        {selectedPlace.estrellas}★
                      </span>
                    )}
                    {selectedPlace.rango_precios &&
                      selectedPlace.rango_precios > 0 && (
                        <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                          {renderPriceRange(selectedPlace.rango_precios)}
                        </span>
                      )}
                    {selectedPlace.tipo_comida && (
                      <span className="rounded-full border border-slate-700 px-2 py-[2px] text-[11px] text-slate-300">
                        {selectedPlace.tipo_comida}
                      </span>
                    )}
                  </div>

                  {selectedPlace.url_instagram && (
                    <a
                      href={selectedPlace.url_instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1"
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
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{t.reviewTitle}</h4>
                  <p className="text-[12px] text-slate-300 whitespace-pre-line">
                    {selectedPlace.resena}
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">
                    {t.addressLabel}
                  </p>
                  <p className="text-slate-400">
                    {selectedPlace.direccion || '-'}
                  </p>
                  {selectedPlace.url_maps && (
                    <a
                      href={selectedPlace.url_maps}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 mt-1 inline-block"
                    >
                      {t.howToGetThere}
                    </a>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">
                    {t.scheduleLabel}
                  </p>
                  <p className="text-slate-400">
                    {selectedPlace.horario_text || '-'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">
                    {t.websiteLabel}
                  </p>
                  {selectedPlace.sitio_web ? (
                    <a
                      href={selectedPlace.sitio_web}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all"
                    >
                      {selectedPlace.sitio_web}
                    </a>
                  ) : (
                    <p className="text-slate-400">-</p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">
                    {t.bookingsLabel}
                  </p>
                  {selectedPlace.url_reservas || selectedPlace.url_reserva ? (
                    <a
                      href={
                        selectedPlace.url_reservas ||
                        selectedPlace.url_reserva ||
                        '#'
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all"
                    >
                      {t.makeBooking}
                    </a>
                  ) : (
                    <p className="text-slate-400">-</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
