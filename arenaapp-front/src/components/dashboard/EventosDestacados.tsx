'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'

type Props = {
  isLoggedIn: boolean
}

interface Event {
  id: number
  titulo: string
  slug: string
  descripcion_corta: string | null
  descripcion_larga: string | null
  categoria: string | null
  es_destacado: boolean
  fecha_inicio: string
  fecha_fin: string | null
  es_todo_el_dia: boolean
  nombre_lugar: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  pais: string | null
  es_gratuito: boolean
  precio_desde: number | null
  moneda: string | null
  url_entradas: string | null
  edad_minima: number | null
  imagen_principal: string | null
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/eventos/destacados`

function formatDateRange (ev: Event): string {
  const start = ev.fecha_inicio ? new Date(ev.fecha_inicio) : null
  const end = ev.fecha_fin ? new Date(ev.fecha_fin) : null

  if (!start) return '-'

  const optsDay: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  }
  const optsTime: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  }

  const startDay = start.toLocaleDateString('es-AR', optsDay)
  const startTime = start.toLocaleTimeString('es-AR', optsTime)

  if (!end || ev.es_todo_el_dia) {
    return ev.es_todo_el_dia
      ? `${startDay} · Todo el día`
      : `${startDay} · ${startTime} hs`
  }

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  const endTime = end.toLocaleTimeString('es-AR', optsTime)

  if (sameDay) {
    return `${startDay} · ${startTime} - ${endTime} hs`
  }

  const endDay = end.toLocaleDateString('es-AR', optsDay)
  return `${startDay} ${startTime} hs → ${endDay} ${endTime} hs`
}

function formatPrice (ev: Event): string {
  if (ev.es_gratuito) return 'Entrada gratuita'
  if (ev.precio_desde != null) {
    const currency = (ev.moneda || 'ARS').toUpperCase()
    return `Desde ${currency} ${ev.precio_desde.toLocaleString('es-AR')}`
  }
  return 'Consultar precio'
}

export default function WeekendEventsSection ({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<Event | null>(null)
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
        const eventos: Event[] = Array.isArray(data) ? data : data.eventos ?? []

        setEvents(eventos)
      } catch (e: any) {
        console.error('Error cargando eventos destacados', e)
        setError('No se pudieron cargar los eventos destacados.')
      } finally {
        setLoading(false)
      }
    }

    fetchDestacados()
  }, [])

  const handleMoreInfo = (ev: Event) => {
    // Podés usar esta lógica para redirigir a /eventos?eventoId=...
    setSelected(ev)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelected(null)
  }

  const topEvents = events.slice(0, 4)

  return (
    <section className='mt-4 space-y-3'>
      <div className='flex items-center justify-between gap-2'>
        <div>
          <h2 className='text-sm font-semibold text-slate-100'>
            Eventos destacados del finde
          </h2>
          <p className='text-[11px] text-slate-400'>
            Recitales, salidas y planes para aprovechar la ciudad.
          </p>
        </div>

        <button
          type='button'
          className='text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2'
          onClick={() => goTo('/eventos')}
        >
          Ver todos
        </button>
      </div>

      {loading && (
        <p className='text-xs text-slate-400'>Cargando eventos destacados...</p>
      )}

      {error && !loading && <p className='text-xs text-red-400'>{error}</p>}

      {!loading && !error && topEvents.length === 0 && (
        <p className='text-xs text-slate-400'>
          Cuando el admin cargue eventos, los vas a ver listados acá.
        </p>
      )}

      {!loading && !error && topEvents.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          {topEvents.map(ev => (
            <button
              key={ev.id}
              type='button'
              onClick={() => handleMoreInfo(ev)}
              className='group text-left rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/70 hover:bg-slate-900 transition-colors flex flex-col overflow-hidden'
            >
              <div className='relative w-full h-28 sm:h-32 bg-slate-800'>
                <Image
                  alt={ev.titulo}
                  src={
                    ev.imagen_principal ||
                    '/images/placeholders/evento-placeholder.jpg'
                  }
                  fill
                  className='object-cover group-hover:scale-[1.03] transition-transform'
                  sizes='(max-width: 768px) 100vw, 25vw'
                />
              </div>

              <div className='p-3 flex-1 flex flex-col gap-1 text-[11px]'>
                <p className='text-[10px] uppercase font-semibold text-emerald-400'>
                  {ev.categoria || 'Evento'}
                </p>
                <h3 className='text-sm font-semibold line-clamp-1'>
                  {ev.titulo}
                </h3>

                {ev.nombre_lugar && (
                  <p className='text-[11px] text-slate-300 line-clamp-1'>
                    {ev.nombre_lugar}
                  </p>
                )}

                <p className='text-[11px] text-slate-400'>
                  {formatDateRange(ev)}
                </p>

                {ev.descripcion_corta && (
                  <p className='text-slate-400 line-clamp-2'>
                    {ev.descripcion_corta}
                  </p>
                )}

                <p className='mt-1 text-[11px] text-emerald-300'>
                  {formatPrice(ev)}
                </p>

                <div className='mt-2 flex justify-end'>
                  <span className='text-[11px] font-medium text-emerald-300 group-hover:text-emerald-200'>
                    Más info
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isModalOpen && selected && (
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
                    alt={selected.titulo}
                    src={
                      selected.imagen_principal ||
                      '/images/placeholders/evento-placeholder.jpg'
                    }
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, 160px'
                  />
                </div>

                <div className='flex-1 space-y-1'>
                  <p className='text-[11px] uppercase font-semibold text-emerald-400'>
                    {selected.categoria || 'Evento'}
                  </p>
                  <h3 className='text-lg font-semibold'>{selected.titulo}</h3>

                  <p className='text-[12px] text-slate-300'>
                    {selected.nombre_lugar || selected.direccion || '-'}
                  </p>
                  <p className='text-[12px] text-slate-400'>
                    {selected.ciudad}
                    {selected.provincia ? `, ${selected.provincia}` : ''}{' '}
                    {selected.pais ? `(${selected.pais})` : ''}
                  </p>

                  <p className='text-[12px] text-emerald-300'>
                    {formatDateRange(selected)}
                  </p>
                  <p className='text-[12px] text-emerald-300'>
                    {formatPrice(selected)}
                  </p>
                </div>
              </div>

              {selected.descripcion_larga && (
                <div className='space-y-1'>
                  <h4 className='text-sm font-semibold'>Descripción</h4>
                  <p className='text-[12px] text-slate-300 whitespace-pre-line'>
                    {selected.descripcion_larga}
                  </p>
                </div>
              )}

              <div className='grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]'>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-300'>
                    Dirección
                  </p>
                  <p className='text-slate-400'>{selected.direccion || '-'}</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-300'>
                    Entradas
                  </p>
                  {selected.url_entradas ? (
                    <a
                      href={selected.url_entradas}
                      target='_blank'
                      rel='noreferrer'
                      className='text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all'
                    >
                      Comprar entradas
                    </a>
                  ) : (
                    <p className='text-slate-400'>-</p>
                  )}
                </div>

                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-300'>
                    Edad mínima
                  </p>
                  <p className='text-slate-400'>
                    {selected.edad_minima != null
                      ? `${selected.edad_minima}+`
                      : 'Apta para todo público'}
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
