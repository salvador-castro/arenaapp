///Users/salvacastro/Desktop/arenaapp/arenaapp-front/src/app/page.tsx
'use client'

import TopNav from '@/components/TopNav'
import HeroCarousel from 'src/components/HeroCarousel'
import BottomNav from 'src/components/BottomNav'
import PromoBanner from 'src/components/PromoBanner'
import CategoryCards from '@/components/CategoryCards'
import { useAuth } from '@/context/AuthContext'

export default function HomePage() {
  const { user, isLoading }: any = useAuth()
  const isLoggedIn = !isLoading && !!user

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <TopNav isLoggedIn={isLoggedIn} />

      <main className="flex-1 pb-32">
        <HeroCarousel isLoggedIn={isLoggedIn} />

        {!isLoggedIn && (
          <section className="px-4 pt-6">
            <PromoBanner />
          </section>
        )}

        <section className="px-4 pt-8 pb-6">
          <CategoryCards />
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
