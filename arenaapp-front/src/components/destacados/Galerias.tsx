// /Users/salvacastro/Desktop/arenaapp/arenaapp-front/src/components/destacados/Galerias.tsx
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
  estrellas: number | null
  es_destacado: boolean
  estado: string
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/galerias/destacados`

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

function formatStars(estrellas: number | null): string {
  if (!estrellas || estrellas < 1) return '-'
  const value = Math.min(Math.max(estrellas, 1), 5)
  return '★'.repeat(value)
}

export default function GaleriasDestacadas({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)
  const { auth }: any = useAuth()
  const userRole: string | undefined = auth?.user?.role // se mantiene aunque hoy no se use
  const { locale } = useLocale()

  const [places, setPlaces] = useState<Galeria[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedPlace, setSelectedPlace] = useState<Galeria | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 🔥 Traducciones de UI
  const t = {
    es: {
      sectionTitle: 'Galerías destacadas',
      sectionSubtitle:
        'Espacios culturales para descubrir arte y exposiciones.',
      seeAll: 'Ver todas',
      loading: 'Cargando galerías destacadas...',
      error: 'No se pudieron cargar las galerías destacadas.',
      empty: 'Cuando el admin cargue galerías, las vas a ver listadas acá.',
      locationFallback: 'Ubicación no especificada',
      freeEntry: 'Entrada gratuita',
      requiresReservation: 'Requiere reserva',
      foundedIn: 'Fundada en {year}',
      seeMore: 'Ver más',
      reviewTitle: 'Reseña',
      addressLabel: 'Dirección',
      scheduleLabel: 'Horario',
      websiteLabel: 'Sitio web',
      contactLabel: 'Contacto',
      close: 'Cerrar',
    },
    en: {
      sectionTitle: 'Featured galleries',
      sectionSubtitle: 'Cultural spaces to discover art and exhibitions.',
      seeAll: 'See all',
      loading: 'Loading featured galleries...',
      error: 'Could not load featured galleries.',
      empty: 'Once the admin adds galleries, you will see them listed here.',
      locationFallback: 'Location not specified',
      freeEntry: 'Free entry',
      requiresReservation: 'Reservation required',
      foundedIn: 'Founded in {year}',
      seeMore: 'See more',
      reviewTitle: 'Review',
      addressLabel: 'Address',
      scheduleLabel: 'Schedule',
      websiteLabel: 'Website',
      contactLabel: 'Contact',
      close: 'Close',
    },
    pt: {
      sectionTitle: 'Galerias em destaque',
      sectionSubtitle: 'Espaços culturais para descobrir arte e exposições.',
      seeAll: 'Ver todas',
      loading: 'Carregando galerias em destaque...',
      error: 'Não foi possível carregar as galerias em destaque.',
      empty: 'Quando o admin cadastrar galerias, você verá a lista aqui.',
      locationFallback: 'Localização não especificada',
      freeEntry: 'Entrada gratuita',
      requiresReservation: 'Requer reserva',
      foundedIn: 'Fundada em {year}',
      seeMore: 'Ver mais',
      reviewTitle: 'Resenha',
      addressLabel: 'Endereço',
      scheduleLabel: 'Horário',
      websiteLabel: 'Site',
      contactLabel: 'Contato',
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

        const galerias: Galeria[] = Array.isArray(data)
          ? data
          : (data.galerias ?? [])
        const destacados = galerias.filter((g) => g.es_destacado === true)

        setPlaces(destacados)
      } catch (e: any) {
        console.error('Error cargando galerías destacadas', e)
        // mensaje visible lo maneja t.error
        setError('LOAD_ERROR')
      } finally {
        setLoading(false)
      }
    }

    fetchDestacados()
  }, [])

  const handleMoreInfo = (place: Galeria) => {
    // si NO está logueado → login con redirect a /galerias?galeriaId=ID
    if (!isLoggedIn) {
      const redirectUrl = `/galerias?galeriaId=${place.id}`
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
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            {t.sectionTitle}
          </h2>
          <p className="text-[11px] text-slate-400">{t.sectionSubtitle}</p>
        </div>

        <button
          type="button"
          className="text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          onClick={() => goTo('/galerias')}
        >
          {t.seeAll}
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
                  {place.zona ||
                    place.ciudad ||
                    place.provincia ||
                    t.locationFallback}
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
                  {place.tiene_entrada_gratuita && (
                    <span className="inline-flex rounded-full border border-emerald-500/60 px-2 py-[2px] text-[10px] text-emerald-300">
                      {t.freeEntry}
                    </span>
                  )}
                  {place.requiere_reserva && (
                    <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                      {t.requiresReservation}
                    </span>
                  )}
                  {place.anio_fundacion && (
                    <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                      {t.foundedIn.replace(
                        '{year}',
                        String(place.anio_fundacion)
                      )}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4">
          <div className="relative mt-10 mb-24 w-full max-w-lg max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
            <button
              type="button"
              onClick={closeModal}
              className="sticky top-3 ml-auto mr-3 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
            >
              ✕
            </button>

            <div className="px-4 pb-4 pt-1 sm:p-6 space-y-4">
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
                    {selectedPlace.zona ||
                      selectedPlace.ciudad ||
                      selectedPlace.provincia ||
                      t.locationFallback}
                  </p>
                  <h3 className="text-lg font-semibold">
                    {selectedPlace.nombre}
                  </h3>

                  {selectedPlace.instagram && (
                    <a
                      href={selectedPlace.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 mt-1"
                    >
                      <Instagram size={14} />
                      <span>
                        @{getInstagramHandle(selectedPlace.instagram)}
                      </span>
                    </a>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-slate-300">
                    {selectedPlace.estrellas && selectedPlace.estrellas > 0 && (
                      <span className="inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300">
                        {selectedPlace.estrellas}★
                      </span>
                    )}
                    {selectedPlace.tiene_entrada_gratuita && (
                      <span className="inline-flex rounded-full border border-emerald-500/60 px-2 py-[2px] text-[10px] text-emerald-300">
                        {t.freeEntry}
                      </span>
                    )}
                    {selectedPlace.requiere_reserva && (
                      <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                        {t.requiresReservation}
                      </span>
                    )}
                    {selectedPlace.anio_fundacion && (
                      <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                        {t.foundedIn.replace(
                          '{year}',
                          String(selectedPlace.anio_fundacion)
                        )}
                      </span>
                    )}
                  </div>
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
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">
                    {t.scheduleLabel}
                  </p>
                  <p className="text-slate-400">
                    {selectedPlace.horario_desde || selectedPlace.horario_hasta
                      ? `${selectedPlace.horario_desde ?? ''}${
                          selectedPlace.horario_desde &&
                          selectedPlace.horario_hasta
                            ? ' - '
                            : ''
                        }${selectedPlace.horario_hasta ?? ''}`
                      : '-'}
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
                    {t.contactLabel}
                  </p>
                  <p className="text-slate-400">
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
