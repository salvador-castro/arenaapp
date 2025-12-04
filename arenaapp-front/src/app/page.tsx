//C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\src\app\page.tsx
import HeroCarousel from 'src/components/HeroCarousel'
import BottomNav from 'src/components/BottomNav'
import AdBanner from 'src/components/AdBanner'
import CategoryChips from 'src/components/CategoryChips'
import PromoBanner from 'src/components/PromoBanner'
import RecommendedSection from 'src/components/RecommendedSection'
import RestaurantesDashboard from 'src/components/RestaurantesDashboard'
import WeekendEventsSection from 'src/components/WeekendEventsSection'

export default function HomePage () {
  // Más adelante esto va a salir de un contexto / cookie de auth
  const isLoggedIn = false

  return (
    <main className='min-h-screen flex flex-col bg-slate-950 text-slate-50'>
      <div className='flex-1 pb-32'>
        <HeroCarousel isLoggedIn={isLoggedIn} />

        <section className='px-4 pt-6'>
          <RecommendedSection isLoggedIn={isLoggedIn} />
        </section>

        <section className='px-4 pt-6'>
          <PromoBanner />
        </section>

        <section className='px-4 pt-6'>
          <RestaurantesDashboard isLoggedIn={isLoggedIn} />
        </section>

        <section className='px-4 pt-6 pb-4'>
          <WeekendEventsSection isLoggedIn={isLoggedIn} />
        </section>

        <AdBanner />
      </div>

      <BottomNav />
    </main>
  )
}
