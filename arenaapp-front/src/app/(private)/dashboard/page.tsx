// C:\Users\salvaCastro\Desktop\arenaapp-front\src\app\(private)\dashboard\page.tsx
'use client'

import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'
import { useLocale } from '@/context/LocaleContext'
import { describe } from 'node:test'

const DASHBOARD_TEXTS = {
  es: {
    welcome: 'Bienvenido',
    subtitle: '¿Qué te gustaría explorar hoy?',
    sectionTitle: 'Explorá por categoría',
    sectionSubtitle: 'Entrá directo a la sección que quieras descubrir.',
    proximamente: 'Proximamente',
    cards: {
      favoritos: {
        tag: 'Tus listas',
        title: 'Favoritos',
        desc: 'Restaurantes, galerías y más que marcaste.',
      },
      restaurantes: {
        tag: 'Comer',
        title: 'Restaurantes',
        desc: 'Cocina local, internacional y más.',
      },
      galerias: {
        tag: 'Arte',
        title: 'Galerías & Museos',
        desc: 'Exhibiciones, muestras y cultura visual.',
      },
      hoteles: {
        tag: 'Hospedaje',
        title: 'Hoteles',
        desc: 'Descansá en los mejores alojamientos.',
      },
      shopping: {
        tag: 'Compras',
        title: 'Shopping',
        desc: 'Centros comerciales y paseos de compras.',
      },
      eventos: {
        tag: 'Agenda',
        title: 'Eventos',
        desc: 'Qué hacer hoy, mañana o el finde.',
      },
      bares: {
        tag: 'Noche',
        title: 'Bares',
        desc: 'Cocktails, vino y buena música.',
      },
    },
  },
  en: {
    welcome: 'Welcome',
    subtitle: 'What would you like to explore today?',
    sectionTitle: 'Explore by category',
    sectionSubtitle: 'Jump straight into the section you want to discover.',
    proximamente: 'Coming soon',
    cards: {
      favoritos: {
        tag: 'Your lists',
        title: 'Favorites',
        desc: 'Restaurants, galleries and more you saved.',
      },
      restaurantes: {
        tag: 'Food',
        title: 'Restaurants',
        desc: 'Local, international and more.',
      },
      galerias: {
        tag: 'Art',
        title: 'Galleries & Museums',
        desc: 'Exhibitions, shows and visual culture.',
      },
      hoteles: {
        tag: 'Stay',
        title: 'Hotels',
        desc: 'Rest at the best places.',
      },
      shopping: {
        tag: 'Shopping',
        title: 'Malls',
        desc: 'Shopping centers and malls.',
      },
      eventos: {
        tag: 'Agenda',
        title: 'Events',
        desc: 'What to do today, tomorrow or on the weekend.',
      },
      bares: {
        tag: 'Night',
        title: 'Bars',
        desc: 'Cocktails, wine and good music.',
      },
    },
  },
  pt: {
    welcome: 'Bem-vindo',
    subtitle: 'O que você gostaria de explorar hoje?',
    sectionTitle: 'Explore por categoria',
    sectionSubtitle: 'Vá direto para a seção que quer conhecer.',
    proximamente: 'Proximamente',
    cards: {
      favoritos: {
        tag: 'Suas listas',
        title: 'Favoritos',
        desc: 'Restaurantes, galerias e mais que você salvou.',
      },
      restaurantes: {
        tag: 'Comer',
        title: 'Restaurantes',
        desc: 'Cozinha local, internacional e muito mais.',
      },
      galerias: {
        tag: 'Arte',
        title: 'Galerias & Museos',
        desc: 'Exposições, mostras e cultura visual.',
      },
      hoteles: {
        tag: 'Hospedagem',
        title: 'Hotéis',
        desc: 'Descanse nos melhores lugares.',
      },
      shopping: {
        tag: 'Compras',
        title: 'Shopping',
        desc: 'Centros comerciais e shoppings.',
      },
      eventos: {
        tag: 'Agenda',
        title: 'Eventos',
        desc: 'O que fazer hoje, amanhã ou no fim de semana.',
      },
      bares: {
        tag: 'Noite',
        title: 'Bares',
        desc: 'Drinks, vinho e boa música.',
      },
    },
  },
} as const

export default function DashboardPage () {
  const { user, isLoading }: any = useAuth()
  const isLoggedIn = !isLoading && !!user
  const { goTo } = useAuthRedirect(isLoggedIn)
  const { locale } = useLocale()

  const t =
    DASHBOARD_TEXTS[locale as keyof typeof DASHBOARD_TEXTS] ??
    DASHBOARD_TEXTS.es

  const firstName = user?.nombre ?? user?.firstName ?? ''

  const handleGoToSection = (path: string) => {
    goTo(path)
  }

  return (
    <div className='min-h-screen pb-16 flex flex-col bg-slate-950'>
      {/* NAVBAR SUPERIOR REUTILIZABLE */}
      <TopNav isLoggedIn={isLoggedIn} />

      {/* CONTENIDO PRINCIPAL */}
      <main className='flex-1 max-w-3xl mx-auto px-4 pt-4 pb-4 space-y-6'>
        {/* Saludo */}
        <header className='flex flex-col gap-1'>
          <h1 className='text-lg md:text-xl font-medium text-slate-100'>
            {t.welcome}
            {firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className='text-xs text-slate-400'>{t.subtitle}</p>
        </header>

        {/* Explorá por categoría */}
        <section className='space-y-3'>
          <h2 className='text-lg font-semibold text-slate-100'>
            {t.sectionTitle}
          </h2>
          <p className='text-xs text-slate-400'>{t.sectionSubtitle}</p>

          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            {/* Favoritos */}
            <button
              type='button'
              onClick={() => handleGoToSection('/favoritos')}
              className='relative rounded-xl overflow-hidden border border-emerald-500/50 hover:border-emerald-400 transition-colors bg-cover bg-center'
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/favoritos.png?v=2 ')",
              }}
            >
              <div className='absolute inset-0 bg-slate-950/60' />
              <div className='relative px-3 py-4 text-left'>
                <p className='text-[11px] font-semibold text-emerald-300 mb-1'>
                  {t.cards.favoritos.tag}
                </p>
                <p className='text-sm font-semibold text-white'>
                  {t.cards.favoritos.title}
                </p>
                <p className='text-[11px] text-slate-200 mt-1'>
                  {t.cards.favoritos.desc}
                </p>
              </div>
            </button>

            {/* Restaurantes */}
            <button
              type='button'
              onClick={() => handleGoToSection('/restaurantes')}
              className='relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center'
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/restaurantes.png?v=2 ')",
              }}
            >
              <div className='absolute inset-0 bg-slate-950/60' />
              <div className='relative px-3 py-4 text-left'>
                <p className='text-[11px] font-semibold text-emerald-300 mb-1'>
                  {t.cards.restaurantes.tag}
                </p>
                <p className='text-sm font-semibold text-white'>
                  {t.cards.restaurantes.title}
                </p>
                <p className='text-[11px] text-slate-200 mt-1'>
                  {t.cards.restaurantes.desc}
                </p>
              </div>
            </button>

            <p className='text-xs text-slate-400'>{t.proximamente}</p>

            {/* Galerías */}
            <button
              type='button'
              /* onClick={() => handleGoToSection('/galerias-museos')} */
              className='relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center'
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/galerias.png?v=2 ')",
              }}
            >
              <div className='absolute inset-0 bg-slate-950/60' />
              <div className='relative px-3 py-4 text-left'>
                <p className='text-[11px] font-semibold text-emerald-300 mb-1'>
                  {t.cards.galerias.tag}
                </p>
                <p className='text-sm font-semibold text-white'>
                  {t.cards.galerias.title}
                </p>
                <p className='text-[11px] text-slate-200 mt-1'>
                  {t.cards.galerias.desc}
                </p>
              </div>
            </button>

            {/* Hoteles */}
            <button
              type='button'
              /* onClick={() => handleGoToSection('/hoteles')} */
              className='relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center'
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/hoteles.png?v=2 ')",
              }}
            >
              <div className='absolute inset-0 bg-slate-950/60' />
              <div className='relative px-3 py-4 text-left'>
                <p className='text-[11px] font-semibold text-emerald-300 mb-1'>
                  {t.cards.hoteles.tag}
                </p>
                <p className='text-sm font-semibold text-white'>
                  {t.cards.hoteles.title}
                </p>
                <p className='text-[11px] text-slate-200 mt-1'>
                  {t.cards.hoteles.desc}
                </p>
              </div>
            </button>

            {/* Shopping */}
            <button
              type='button'
              /* onClick={() => handleGoToSection('/shopping')} */
              className='relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center'
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/shopping.png?v=2 ')",
              }}
            >
              <div className='absolute inset-0 bg-slate-950/60' />
              <div className='relative px-3 py-4 text-left'>
                <p className='text-[11px] font-semibold text-emerald-300 mb-1'>
                  {t.cards.shopping.tag}
                </p>
                <p className='text-sm font-semibold text-white'>
                  {t.cards.shopping.title}
                </p>
                <p className='text-[11px] text-slate-200 mt-1'>
                  {t.cards.shopping.desc}
                </p>
              </div>
            </button>

            {/* Eventos */}
            <button
              type='button'
              /* onClick={() => handleGoToSection('/eventos')} */
              className='relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center'
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/eventos.png?v=2 ')",
              }}
            >
              <div className='absolute inset-0 bg-slate-950/60' />
              <div className='relative px-3 py-4 text-left'>
                <p className='text-[11px] font-semibold text-emerald-300 mb-1'>
                  {t.cards.eventos.tag}
                </p>
                <p className='text-sm font-semibold text-white'>
                  {t.cards.eventos.title}
                </p>
                <p className='text-[11px] text-slate-200 mt-1'>
                  {t.cards.eventos.desc}
                </p>
              </div>
            </button>

            {/* Bares */}
            <button
              type='button'
              /* onClick={() => handleGoToSection('/bares')} */
              className='relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center'
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/bars.png?v=2 ')",
              }}
            >
              <div className='absolute inset-0 bg-slate-950/60' />
              <div className='relative px-3 py-4 text-left'>
                <p className='text-[11px] font-semibold text-emerald-300 mb-1'>
                  {t.cards.bares.tag}
                </p>
                <p className='text-sm font-semibold text-white'>
                  {t.cards.bares.title}
                </p>
                <p className='text-[11px] text-slate-200 mt-1'>
                  {t.cards.bares.desc}
                </p>
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* Bottom navigation (usuario) */}
      <BottomNav />
    </div>
  )
}
