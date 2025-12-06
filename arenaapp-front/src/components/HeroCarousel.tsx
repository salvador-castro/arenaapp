'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'

type HeroCarouselProps = {
  isLoggedIn: boolean
}

const slides = [
  {
    id: 1,
    title: 'Descubrí los mejores bares',
    description: 'Los spots ideales para salir con amigos.',
    image:
      'https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/carruselPrincipal/bars.jpg',
    cta: 'Ver bares',
    target: '/bares'
  },
  {
    id: 2,
    title: 'Eventos y actividades',
    description: 'Lo mejor que está pasando en la ciudad hoy.',
    image:
      'https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/carruselPrincipal/eventos.jpg',
    cta: 'Ver eventos',
    target: '/eventos'
  },
  {
    id: 3,
    title: 'Gastronomía gourmet',
    description: 'Restaurantes destacados para disfrutar.',
    image:
      'https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/carruselPrincipal/gourmet.jpg',
    cta: 'Ver restaurantes',
    target: '/restaurantes'
  }
]

export default function HeroCarousel ({ isLoggedIn }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const total = slides.length
  const { goTo } = useAuthRedirect(isLoggedIn)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % total)
    }, 5000)

    return () => clearInterval(timer)
  }, [total])

  const goToSlide = (index: number) => {
    setActiveIndex((index + total) % total)
  }

  const current = slides[activeIndex]

  return (
    <section className='relative w-full h-[420px] overflow-hidden rounded-b-3xl bg-slate-900 text-white shadow-lg'>
      {/* Imagen de fondo */}
      <div className='absolute inset-0'>
        <Image
          src={current.image}
          alt={current.title}
          fill
          priority
          className='object-cover'
        />
        <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10' />
      </div>

      {/* Contenido */}
      <div className='relative z-10 h-full flex flex-col justify-between px-5 pt-6 pb-5'>
        {/* Dots */}
        <div className='flex justify-end gap-1.5'>
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`Ir al slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Texto */}
        <div className='mt-6'>
          <h1 className='text-3xl font-semibold tracking-tight drop-shadow-md'>
            {current.title}
          </h1>
          <p className='mt-3 text-sm text-slate-100/90 max-w-md drop-shadow-md'>
            {current.description}
          </p>
        </div>

        {/* CTA + flechas */}
        <div className='flex items-center justify-between mt-6'>
          <button
            className='px-4 py-2.5 rounded-full bg-white text-slate-900 text-sm font-semibold shadow-md hover:bg-slate-100 active:scale-[0.98] transition cursor-pointer'
            onClick={() => goTo(current.target)}
          >
            {current.cta}
          </button>

          <div className='flex gap-2'>
            <button
              onClick={() => goToSlide(activeIndex - 1)}
              className='w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-lg cursor-pointer'
            >
              ‹
            </button>

            <button
              onClick={() => goToSlide(activeIndex + 1)}
              className='w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-lg cursor-pointer'
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
