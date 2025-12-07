// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\src\components\dashboard\BaresDestacados.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'

type Props = {
  isLoggedIn: boolean
}

interface Bar {
  id: number | string
  nombre: string
  slug: string
  descripcion_corta: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  pais: string | null
  zona: string | null
  tipo_comida: string | null
  rango_precios: number | null
  estrellas: number | null
  es_destacado: boolean
  sitio_web: string | null
  instagram: string | null
  facebook: string | null
  url_imagen: string | null
  imagen_principal: string | null
  url_reserva: string | null
  url_maps: string | null
  horario_text: string | null
  resena: string | null
  tiene_terraza?: boolean | null
  tiene_musica_vivo?: boolean | null
  tiene_happy_hour?: boolean | null
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/bares/destacados`

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

export default function BaresDestacados ({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)
  const [bares, setBares] = useState<Bar[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBares = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(DESTACADOS_ENDPOINT, {
          method: 'GET'
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: Bar[] = await res.json()
        setBares(Array.isArray(data) ? data.filter(b => b.es_destacado) : [])
      } catch (err: any) {
        console.error('Error cargando bares destacados:', err)
        setError(err.message ?? 'Error al cargar bares destacados')
      } finally {
        setLoading(false)
      }
    }

    fetchBares()
  }, [])

  const handleMoreInfo = (bar: Bar) => {
    const redirectUrl = `/bares?barId=${bar.id}`

    // Igual lógica que RestaurantesDestacados:
    // - si no está logueado, useAuthRedirect lo manda a /login?redirect=redirectUrl
    // - si está logueado, lo manda directo a /bares?barId=...
    goTo(redirectUrl)
  }

  if (loading) {
    return (
      <section className='mt-4'>
        <h2 className='text-sm font-semibold text-slate-100 mb-2'>
          Bares destacados
        </h2>
        <p className='text-xs text-slate-400'>Cargando bares destacados...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className='mt-4'>
        <h2 className='text-sm font-semibold text-slate-100 mb-2'>
          Bares destacados
        </h2>
        <p className='text-xs text-red-400'>{error}</p>
      </section>
    )
  }

  if (!bares.length) {
    return null
  }

  const topBares = bares.slice(0, 4)

  return (
    <section className='mt-4 space-y-3'>
      <div className='flex items-center justify-between gap-2'>
        <div>
          <h2 className='text-sm font-semibold text-slate-100'>
            Bares destacados
          </h2>
          <p className='text-[11px] text-slate-400'>
            Elegidos por su ambiente, tragos y experiencia.
          </p>
        </div>
        <button
          type='button'
          onClick={() => goTo('/bares')}
          className='text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2'
        >
          Ver todos
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        {topBares.map(bar => (
          <button
            key={bar.id}
            type='button'
            onClick={() => handleMoreInfo(bar)}
            className='group text-left rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/70 hover:bg-slate-900 transition-colors flex flex-col overflow-hidden'
          >
            <div className='relative w-full h-28 sm:h-32 bg-slate-800'>
              <Image
                alt={bar.nombre}
                src={
                  bar.url_imagen ||
                  bar.imagen_principal ||
                  '/images/placeholders/restaurante-placeholder.jpg'
                }
                fill
                className='object-cover group-hover:scale-[1.03] transition-transform'
                sizes='(max-width: 768px) 100vw, 25vw'
              />
            </div>

            <div className='p-3 flex-1 flex flex-col gap-1 text-[11px]'>
              <p className='text-[10px] uppercase font-semibold text-emerald-400'>
                {bar.zona || bar.ciudad || 'Zona no especificada'}
              </p>
              <h3 className='text-sm font-semibold line-clamp-1'>
                {bar.nombre}
              </h3>

              {bar.descripcion_corta && (
                <p className='text-slate-400 line-clamp-2'>
                  {bar.descripcion_corta}
                </p>
              )}

              <div className='flex items-center gap-2 mt-1'>
                <span className='text-amber-400'>
                  {renderStars(bar.estrellas)}
                </span>
                <span className='text-slate-400'>
                  {renderPriceRange(bar.rango_precios)}
                </span>
              </div>

              {bar.tipo_comida && (
                <span className='mt-1 inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300'>
                  {bar.tipo_comida}
                </span>
              )}

              <div className='mt-2 flex justify-end'>
                <span className='text-[11px] font-medium text-emerald-300 group-hover:text-emerald-200'>
                  Ver más
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
