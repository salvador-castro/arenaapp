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
    title: 'Descubrí dónde ir hoy',
    description: 'Restaurantes, bares, cafés y planes cerca tuyo.',
    image:
      'https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=1600',
    cta: 'Explorar lugares',
    target: '/lugares' // ruta a donde queremos ir
  },
  {
    id: 2,
    title: 'Guardá tus favoritos',
    description: 'Armá tu lista de spots para volver cuando quieras.',
    image:
      'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1600',
    cta: 'Ver favoritos',
    target: '/favoritos'
  },
  {
    id: 3,
    title: 'Eventos y planes',
    description: 'Enterate qué está pasando este finde en la ciudad.',
    image:
      'https://images.pexels.com/photos/154147/pexels-photo-154147.jpeg?auto=compress&cs=tinysrgb&w=1600',
    cta: 'Ver agenda',
    target: '/agenda'
  }
]

export default function HeroCarousel ({ isLoggedIn }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const total = slides.length
  const { goTo } = useAuthRedirect(isLoggedIn)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % total)
    }, 5000) // 5s

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
        {/* Dots arriba derecha (pager) */}
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

        {/* Texto principal */}
        <div className='mt-6'>
          <h1 className='text-3xl font-semibold tracking-tight drop-shadow-md'>
            {current.title}
          </h1>
          <p className='mt-3 text-sm text-slate-100/90 max-w-md drop-shadow-md'>
            {current.description}
          </p>
        </div>

        {/* CTA y flechas */}
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
