///Users/salvacastro/Desktop/arenaapp/arenaapp-front/src/components/destacados/Shopping.tsx
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

interface Shopping {
  id: number | string
  slug: string
  nombre: string
  rango_precios: number | null
  estrellas: number | null
  zona: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  pais: string | null
  horario_text: string | null
  sitio_web: string | null
  url_imagen: string | null
  cantidad_locales: number | null
  tiene_estacionamiento: boolean | null
  tiene_patio_comidas: boolean | null
  tiene_cine: boolean | null
  es_outlet: boolean | null
  es_destacado: boolean
  telefono: string | null
  instagram: string | null
  facebook: string | null
  estado: string
  resena: string | null
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/shopping/destacados`

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

function formatPriceRange(n: number | null): string {
  if (n == null || n <= 0) return '-'
  if (n > 5) return '$$$$$'
  return '$'.repeat(n)
}

function formatStars(estrellas: number | null): string {
  if (!estrellas || estrellas < 1) return '-'
  const value = Math.min(Math.max(estrellas, 1), 5)
  return '★'.repeat(value)
}

export default function ShoppingDestacados({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)
  const { auth }: any = useAuth()
  const _userRole: string | undefined = auth?.user?.role
  const { locale } = useLocale()

  const [places, setPlaces] = useState<Shopping[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedPlace, setSelectedPlace] = useState<Shopping | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 🔥 Traducciones de UI
  const t = {
    es: {
      sectionTitle: 'Shoppings destacados',
      sectionSubtitle: 'Centros comerciales y outlets para salir de compras.',
      seeAll: 'Ver todos',
      loading: 'Cargando shoppings destacados...',
      error: 'No se pudieron cargar los shoppings destacados.',
      empty: 'Cuando el admin cargue shoppings, los vas a ver listados acá.',
      locationFallback: 'Ubicación no especificada',
      outlet: 'Outlet',
      cinema: 'Cine',
      foodCourt: 'Patio de comidas',
      parking: 'Estacionamiento',
      stores: '{count} locales',
      seeMore: 'Ver más',
      reviewTitle: 'Reseña',
      addressLabel: 'Dirección',
      scheduleLabel: 'Horario',
      websiteLabel: 'Sitio web',
      contactLabel: 'Contacto',
      close: 'Cerrar',
    },
    en: {
      sectionTitle: 'Featured malls',
      sectionSubtitle: 'Malls and outlets for your shopping plans.',
      seeAll: 'See all',
      loading: 'Loading featured malls...',
      error: 'Could not load featured malls.',
      empty: 'Once the admin adds malls, you will see them listed here.',
      locationFallback: 'Location not specified',
      outlet: 'Outlet',
      cinema: 'Cinema',
      foodCourt: 'Food court',
      parking: 'Parking',
      stores: '{count} stores',
      seeMore: 'See more',
      reviewTitle: 'Review',
      addressLabel: 'Address',
      scheduleLabel: 'Opening hours',
      websiteLabel: 'Website',
      contactLabel: 'Contact',
      close: 'Close',
    },
    pt: {
      sectionTitle: 'Shoppings em destaque',
      sectionSubtitle: 'Centros comerciais e outlets para sair às compras.',
      seeAll: 'Ver todos',
      loading: 'Carregando shoppings em destaque...',
      error: 'Não foi possível carregar os shoppings em destaque.',
      empty: 'Quando o admin cadastrar shoppings, você verá a lista aqui.',
      locationFallback: 'Localização não especificada',
      outlet: 'Outlet',
      cinema: 'Cinema',
      foodCourt: 'Praça de alimentação',
      parking: 'Estacionamento',
      stores: '{count} lojas',
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

        const shoppings: Shopping[] = Array.isArray(data)
          ? data
          : (data.shopping ?? [])

        const destacados = shoppings.filter((s) => s.es_destacado === true)

        setPlaces(destacados)
      } catch (e: any) {
        console.error('Error cargando shoppings destacados', e)
        // el texto visible lo saca de t.error
        setError('LOAD_ERROR')
      } finally {
        setLoading(false)
      }
    }

    fetchDestacados()
  }, [])

  const handleMoreInfo = (place: Shopping) => {
    // si NO está logueado → login con redirect a /shopping?shoppingId=ID
    if (!isLoggedIn) {
      const redirectUrl = `/shopping?shoppingId=${place.id}`
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
          onClick={() => goTo('/shopping')}
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

                {place.resena && (
                  <p className="text-slate-400 line-clamp-2">{place.resena}</p>
                )}

                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-300">
                  {place.estrellas && place.estrellas > 0 && (
                    <span className="inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300">
                      {place.estrellas}★
                    </span>
                  )}
                  {place.es_outlet && (
                    <span className="inline-flex rounded-full border border-emerald-500/60 px-2 py-[2px] text-[10px] text-emerald-300">
                      {t.outlet}
                    </span>
                  )}
                  {place.tiene_cine && (
                    <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                      {t.cinema}
                    </span>
                  )}
                  {place.tiene_patio_comidas && (
                    <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                      {t.foodCourt}
                    </span>
                  )}
                  {place.tiene_estacionamiento && (
                    <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                      {t.parking}
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
                    {selectedPlace.rango_precios != null && (
                      <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px]">
                        {formatPriceRange(selectedPlace.rango_precios)}
                      </span>
                    )}
                    {selectedPlace.es_outlet && (
                      <span className="inline-flex rounded-full border border-emerald-500/60 px-2 py-[2px] text-[10px] text-emerald-300">
                        {t.outlet}
                      </span>
                    )}
                    {selectedPlace.tiene_cine && (
                      <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                        {t.cinema}
                      </span>
                    )}
                    {selectedPlace.tiene_patio_comidas && (
                      <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                        {t.foodCourt}
                      </span>
                    )}
                    {selectedPlace.tiene_estacionamiento && (
                      <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                        {t.parking}
                      </span>
                    )}
                    {selectedPlace.cantidad_locales != null && (
                      <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                        {t.stores.replace(
                          '{count}',
                          String(selectedPlace.cantidad_locales)
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
                    {t.contactLabel}
                  </p>
                  <p className="text-slate-400">
                    {selectedPlace.telefono || selectedPlace.facebook
                      ? `${selectedPlace.telefono ?? ''}${
                          selectedPlace.telefono && selectedPlace.facebook
                            ? ' · '
                            : ''
                        }${selectedPlace.facebook ?? ''}`
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
