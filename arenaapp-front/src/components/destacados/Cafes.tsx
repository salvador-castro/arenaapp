// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\src\components\dashboard\cafesDestacados.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useLocale } from '@/context/LocaleContext'

type Props = {
  isLoggedIn: boolean
}

interface cafe {
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

const DESTACADOS_ENDPOINT = `${API_BASE}/api/admin/cafes/destacados`

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

export default function cafesDestacados({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)
  const { locale } = useLocale()

  const [cafes, setcafes] = useState<cafe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🔥 Diccionario de traducciones de UI
  const t = {
    es: {
      sectionTitle: 'CAFÉS DESTACADOS',
      sectionSubtitle: 'Elegidos por su ambiente, tragos y experiencia.',
      seeAll: 'Ver todos',
      loading: 'Cargando cafés destacados...',
      error: 'No se pudieron cargar los cafés destacados.',
      zoneFallback: 'Zona no especificada',
      seeMore: 'Ver más',
    },
    en: {
      sectionTitle: 'FEATURED CAFÉS',
      sectionSubtitle: 'Selected for their vibe, drinks and experience.',
      seeAll: 'See all',
      loading: 'Loading featured cafés...',
      error: 'Could not load featured cafés.',
      zoneFallback: 'Zone not specified',
      seeMore: 'See more',
    },
    pt: {
      sectionTitle: 'CAFÉS EM DESTAQUE',
      sectionSubtitle: 'Escolhidos pelo ambiente, bebidas e experiência.',
      seeAll: 'Ver todos',
      loading: 'Carregando cafés em destaque...',
      error: 'Não foi possível carregar os cafés em destaque.',
      zoneFallback: 'Zona não especificada',
      seeMore: 'Ver mais',
    },
  }[locale]


  useEffect(() => {
    const fetchcafes = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(DESTACADOS_ENDPOINT, {
          method: 'GET',
        })

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data: cafe[] = await res.json()
        setcafes(Array.isArray(data) ? data.filter((b) => b.es_destacado) : [])
      } catch (err: any) {
        console.error('Error cargando cafes destacados:', err)
        // el texto visible viene de t.error
        setError('LOAD_ERROR')
      } finally {
        setLoading(false)
      }
    }

    fetchcafes()
  }, [])

  const handleMoreInfo = (cafe: cafe) => {
    const redirectUrl = `/cafes?cafeId=${cafe.id}`

    // Igual lógica que RestaurantesDestacados:
    // - si no está logueado, useAuthRedirect lo manda a /login?redirect=redirectUrl
    // - si está logueado, lo manda directo a /cafes?cafeId=...
    goTo(redirectUrl)
  }

  if (loading) {
    return (
      <section className="mt-4">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">
          {t.sectionTitle}
        </h2>
        <p className="text-xs text-slate-400">{t.loading}</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mt-4">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">
          {t.sectionTitle}
        </h2>
        <p className="text-xs text-red-400">{t.error}</p>
      </section>
    )
  }

  if (!cafes.length) {
    return null
  }

  const topcafes = cafes.slice(0, 4)

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
          onClick={() => goTo('/cafes')}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
        >
          {t.seeAll}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {topcafes.map((cafe) => (
          <button
            key={cafe.id}
            type="button"
            onClick={() => handleMoreInfo(cafe)}
            className="group text-left rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/70 hover:bg-slate-900 transition-colors flex flex-col overflow-hidden"
          >
            <div className="relative w-full h-28 sm:h-32 bg-slate-800">
              <Image
                alt={cafe.nombre}
                src={
                  cafe.url_imagen ||
                  cafe.imagen_principal ||
                  '/images/placeholders/restaurante-placeholder.jpg'
                }
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>

            <div className="p-3 flex-1 flex flex-col gap-1 text-[11px]">
              <p className="text-[10px] uppercase font-semibold text-emerald-400">
                {cafe.zona || cafe.ciudad || t.zoneFallback}
              </p>
              <h3 className="text-sm font-semibold line-clamp-1">
                {cafe.nombre}
              </h3>

              {cafe.descripcion_corta && (
                <p className="text-slate-400 line-clamp-2">
                  {cafe.descripcion_corta}
                </p>
              )}

              <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-300">
                {cafe.estrellas && cafe.estrellas > 0 && (
                  <span className="inline-flex rounded-full border border-amber-500/60 px-2 py-[2px] text-[10px] text-amber-300">
                    {cafe.estrellas}★
                  </span>
                )}
                {cafe.rango_precios && cafe.rango_precios > 0 && (
                  <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                    {renderPriceRange(cafe.rango_precios)}
                  </span>
                )}
                {cafe.tipo_comida && (
                  <span className="inline-flex rounded-full border border-slate-700 px-2 py-[2px] text-[10px] text-slate-300">
                    {cafe.tipo_comida}
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
    </section>
  )
}
