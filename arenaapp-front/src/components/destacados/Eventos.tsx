// C:\Users\salvaCastro\Desktop\arenaapp-front\src\components\EventosDestacados.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import Image from 'next/image'
import { useLocale } from '@/context/LocaleContext'

type Props = {
  isLoggedIn: boolean
}

interface Evento {
  id: number
  titulo: string
  slug: string
  categoria: string
  es_destacado: boolean
  fecha_inicio: string
  fecha_fin: string | null
  es_todo_el_dia: boolean
  zona: string | null
  direccion: string | null
  es_gratuito: boolean
  precio_desde: number | null
  moneda: string | null
  url_entradas: string | null
  estado: string
  visibilidad: string
  resena: string | null
  imagen_principal: string | null
  estrellas: number | null
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const DESTACADOS_EVENTOS_ENDPOINT = `${API_BASE}/api/admin/eventos/destacados`

// 🔥 Mapeo simple de locale a locale de fecha/hora del navegador
const localeMap: Record<'es' | 'en' | 'pt', string> = {
  es: 'es-AR',
  en: 'en-US',
  pt: 'pt-BR',
}

function formatStars(estrellas: number | null): string {
  if (!estrellas || estrellas < 1) return '-'
  const value = Math.min(Math.max(estrellas, 1), 5)
  return '★'.repeat(value)
}

function formatDateRange(
  inicio: string,
  fin: string | null,
  locale: 'es' | 'en' | 'pt'
): string {
  if (!inicio) return '-'

  const start = new Date(inicio)
  const loc = localeMap[locale]

  if (!fin) {
    return start.toLocaleString(loc)
  }

  const end = new Date(fin)

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  if (sameDay) {
    const dateStr = start.toLocaleDateString(loc)
    const startTime = start.toLocaleTimeString(loc, {
      hour: '2-digit',
      minute: '2-digit',
    })
    const endTime = end.toLocaleTimeString(loc, {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${dateStr} · ${startTime} – ${endTime}`
  }

  return `${start.toLocaleString(loc)} – ${end.toLocaleString(loc)}`
}

export default function EventosDestacados({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)
  const { locale } = useLocale()

  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 🔥 Diccionario de textos
  const t = {
    es: {
      sectionTitle: 'Eventos destacados del finde',
      sectionSubtitle: 'Recitales, fiestas y actividades para salir.',
      seeAll: 'Ver todos',
      loading: 'Cargando eventos destacados...',
      error: 'No se pudieron cargar los eventos destacados.',
      empty:
        'Cuando el admin cargue eventos destacados, los vas a ver listados acá.',
      zoneFallback: 'Zona no especificada',
      freeEntry: 'Entrada gratuita',
      fromLabel: 'Desde',
      checkPrices: 'Consultar precios',
      seeMore: 'Ver más',
      descriptionTitle: 'Descripción',
      addressLabel: 'Dirección',
      zoneLabel: 'Zona',
      ticketsLabel: 'Entradas',
      buyTickets: 'Comprar entradas',
      close: 'Cerrar',
    },
    en: {
      sectionTitle: 'Featured events for the weekend',
      sectionSubtitle: 'Concerts, parties and activities to go out.',
      seeAll: 'See all',
      loading: 'Loading featured events...',
      error: 'Could not load featured events.',
      empty:
        'Once the admin adds featured events, you will see them listed here.',
      zoneFallback: 'Zone not specified',
      freeEntry: 'Free entry',
      fromLabel: 'From',
      checkPrices: 'Check prices',
      seeMore: 'See more',
      descriptionTitle: 'Description',
      addressLabel: 'Address',
      zoneLabel: 'Zone',
      ticketsLabel: 'Tickets',
      buyTickets: 'Buy tickets',
      close: 'Close',
    },
    pt: {
      sectionTitle: 'Eventos em destaque no fim de semana',
      sectionSubtitle: 'Shows, festas e atividades para sair.',
      seeAll: 'Ver todos',
      loading: 'Carregando eventos em destaque...',
      error: 'Não foi possível carregar os eventos em destaque.',
      empty:
        'Quando o admin cadastrar eventos em destaque, você verá a lista aqui.',
      zoneFallback: 'Zona não especificada',
      freeEntry: 'Entrada gratuita',
      fromLabel: 'Desde',
      checkPrices: 'Consultar preços',
      seeMore: 'Ver mais',
      descriptionTitle: 'Descrição',
      addressLabel: 'Endereço',
      zoneLabel: 'Zona',
      ticketsLabel: 'Ingressos',
      buyTickets: 'Comprar ingressos',
      close: 'Fechar',
    },
  }[locale]

  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(DESTACADOS_EVENTOS_ENDPOINT, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data = await res.json()

        const eventosResp: Evento[] = Array.isArray(data)
          ? data
          : (data.eventos ?? [])

        setEventos(eventosResp)
      } catch (e: any) {
        console.error('Error cargando eventos destacados', e)
        // El mensaje visible lo maneja t.error
        setError('LOAD_ERROR')
      } finally {
        setLoading(false)
      }
    }

    fetchDestacados()
  }, [])

  const handleMoreInfo = (evento: Evento) => {
    if (!isLoggedIn) {
      const redirectUrl = `/eventos?eventoId=${evento.id}`
      goTo(redirectUrl)
      return
    }

    setSelectedEvento(evento)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedEvento(null)
  }

  const topEventos = eventos.slice(0, 4)

  return (
    <section className="mt-4 space-y-3">
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
          onClick={() => goTo('/eventos')}
        >
          {t.seeAll}
        </button>
      </div>

      {loading && <p className="text-xs text-slate-400">{t.loading}</p>}

      {error && !loading && <p className="text-xs text-red-400">{t.error}</p>}

      {!loading && !error && eventos.length === 0 && (
        <p className="text-xs text-slate-400">{t.empty}</p>
      )}

      {!loading && !error && topEventos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topEventos.map((ev) => (
            <button
              key={ev.id}
              type="button"
              onClick={() => handleMoreInfo(ev)}
              className="group text-left rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/70 hover:bg-slate-900 transition-colors flex flex-col overflow-hidden"
            >
              <div className="relative w-full h-28 sm:h-32 bg-slate-800">
                <Image
                  alt={ev.titulo}
                  src={
                    ev.imagen_principal ||
                    '/images/placeholders/evento-placeholder.jpg'
                  }
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>

              <div className="p-3 flex-1 flex flex-col gap-1 text-[11px]">
                <p className="text-[10px] uppercase font-semibold text-emerald-400">
                  {ev.zona || t.zoneFallback}
                </p>
                <h3 className="text-sm font-semibold line-clamp-1">
                  {ev.titulo}
                </h3>

                <p className="text-slate-400 line-clamp-2">
                  {formatDateRange(ev.fecha_inicio, ev.fecha_fin, locale)}
                </p>

                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-300">
                  {ev.estrellas && ev.estrellas > 0 && (
                    <span className="inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300">
                      {ev.estrellas}★
                    </span>
                  )}
                  <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                    {ev.es_gratuito
                      ? t.freeEntry
                      : ev.precio_desde
                        ? `${t.fromLabel} ${ev.precio_desde} ${ev.moneda || ''}`
                        : t.checkPrices}
                  </span>
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

      {isModalOpen && selectedEvento && (
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
                    alt={selectedEvento.titulo}
                    src={
                      selectedEvento.imagen_principal ||
                      '/images/placeholders/evento-placeholder.jpg'
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 160px"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-[11px] uppercase font-semibold text-emerald-400">
                    {selectedEvento.categoria}
                  </p>
                  <h3 className="text-lg font-semibold">
                    {selectedEvento.titulo}
                  </h3>
                  <p className="text-[12px] text-slate-300">
                    {formatDateRange(
                      selectedEvento.fecha_inicio,
                      selectedEvento.fecha_fin,
                      locale
                    )}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-slate-300">
                    {selectedEvento.estrellas &&
                      selectedEvento.estrellas > 0 && (
                        <span className="inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300">
                          {selectedEvento.estrellas}★
                        </span>
                      )}
                    <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                      {selectedEvento.es_gratuito
                        ? t.freeEntry
                        : selectedEvento.precio_desde
                          ? `${t.fromLabel} ${selectedEvento.precio_desde} ${
                              selectedEvento.moneda || ''
                            }`
                          : t.checkPrices}
                    </span>
                  </div>
                </div>
              </div>

              {selectedEvento.resena && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    {t.descriptionTitle}
                  </h4>
                  <p className="text-[12px] text-slate-300 whitespace-pre-line">
                    {selectedEvento.resena}
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">
                    {t.addressLabel}
                  </p>
                  <p className="text-slate-400">
                    {selectedEvento.direccion || '-'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">
                    {t.zoneLabel}
                  </p>
                  <p className="text-slate-400">{selectedEvento.zona || '-'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300">
                    {t.ticketsLabel}
                  </p>
                  {selectedEvento.url_entradas ? (
                    <a
                      href={selectedEvento.url_entradas}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all"
                    >
                      {t.buyTickets}
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
