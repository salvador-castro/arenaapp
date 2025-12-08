'use client'

import TopNav from '@/components/TopNav'
import HeroCarousel from 'src/components/HeroCarousel'
import BottomNav from 'src/components/BottomNav'
import AdBanner from 'src/components/AdBanner'
import PromoBanner from 'src/components/PromoBanner'
import RestaurantesDestacados from '@/components/destacados/Restaurantes'
import BaresDestacados from '@/components/destacados/Bares'
import EventosDestacados from '@/components/destacados/Eventos'
import GaleriasDestacadas from '@/components/destacados/Galerias'
import HotelesDestacados from '@/components/destacados/Hoteles'
import ShoppingDestacados from '@/components/destacados/Shopping'

export default function HomePage () {
  // por ahora esto quedará así como pediste
  const isLoggedIn = false

  return (
    <div className='min-h-screen flex flex-col bg-slate-950 text-slate-50'>
      {/* 🔥 NAV SUPERIOR → EN HOME SOLO LOGO */}
      <TopNav isLoggedIn={isLoggedIn} />

      <main className='flex-1 pb-32'>
        <HeroCarousel isLoggedIn={isLoggedIn} />

        <section className='px-4 pt-6'>
          <PromoBanner />
        </section>

        <section className='px-4 pt-6'>
          <RestaurantesDestacados isLoggedIn={isLoggedIn} />
        </section>

        <section className='px-4 pt-6'>
          <BaresDestacados isLoggedIn={isLoggedIn} />
        </section>

        <section className='px-4 pt-6 pb-4'>
          <EventosDestacados isLoggedIn={isLoggedIn} />
        </section>

        <section className='px-4 pt-6 pb-4'>
          <GaleriasDestacadas isLoggedIn={isLoggedIn} />
        </section>

        <section className='px-4 pt-6 pb-4'>
          <HotelesDestacados isLoggedIn={isLoggedIn} />
        </section>

        <section className='px-4 pt-6 pb-4'>
          <ShoppingDestacados isLoggedIn={isLoggedIn} />
        </section>

        <AdBanner />
      </main>

      <BottomNav />
    </div>
  )
}
