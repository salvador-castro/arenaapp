'use client'

import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/BottomNav'
import UserDropdown from '@/components/UserDropdown'
import Image from 'next/image'

const LOGO_URL =
  'https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/logo/logo.png'

export default function DashboardPage () {
  const { user, isLoading }: any = useAuth()
  const isLoggedIn = !isLoading && !!user
  const { goTo } = useAuthRedirect(isLoggedIn)

  const firstName = user?.nombre ?? user?.firstName ?? ''

  const handleGoToSection = (path: string) => {
    goTo(path)
  }

  const handleLogoClick = () => {
    goTo('/dashboard')
  }

  return (
    <div className='min-h-screen pb-16 flex flex-col bg-slate-950'>
      {/* NAVBAR SUPERIOR */}
      <header className='sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur'>
        <div className='max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3'>
          <button
            type='button'
            onClick={handleLogoClick}
            className='flex items-center gap-2 focus:outline-none'
          >
            <Image
              src={LOGO_URL}
              alt='ArenaPress'
              width={120}
              height={32}
              className='h-8 w-auto'
              priority
            />
          </button>

          <UserDropdown />
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className='flex-1 max-w-3xl mx-auto px-4 pt-4 pb-4 space-y-6'>
        {/* Saludo */}
        <header className='flex flex-col gap-1'>
          <h1 className='text-xs text-slate-400'>
            Bienvenido{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <h2 className='text-xl font-semibold'>
            ¿Qué te gustaría explorar hoy?
          </h2>
        </header>

        {/* Explorá por categoría */}
        <section className='space-y-3'>
          <h2 className='text-lg font-semibold'>Explorá por categoría</h2>
          <p className='text-xs text-slate-400'>
            Entrá directo a la sección que quieras descubrir.
          </p>

          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            {/* Favoritos */}
            <button
              type='button'
              onClick={() => handleGoToSection('/favoritos')}
              className='rounded-xl border border-emerald-500/40 bg-slate-900/70 px-3 py-4 text-left hover:border-emerald-400 hover:bg-slate-900 transition-colors'
            >
              <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
                Tus listas
              </p>
              <p className='text-sm font-semibold'>Favoritos</p>
              <p className='text-[11px] text-slate-400 mt-1'>
                Restaurantes, galerías y más que marcaste.
              </p>
            </button>

            {/* Restaurantes */}
            <button
              type='button'
              onClick={() => handleGoToSection('/restaurantes')}
              className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
            >
              <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
                Comer
              </p>
              <p className='text-sm font-semibold'>Restaurantes</p>
              <p className='text-[11px] text-slate-400 mt-1'>
                Cocina local, internacional y más.
              </p>
            </button>

            {/* Galerías */}
            <button
              type='button'
              onClick={() => handleGoToSection('/galeria')}
              className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
            >
              <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
                Arte
              </p>
              <p className='text-sm font-semibold'>Galerías</p>
              <p className='text-[11px] text-slate-400 mt-1'>
                Exhibiciones, muestras y cultura visual.
              </p>
            </button>

            {/* Hoteles */}
            <button
              type='button'
              onClick={() => handleGoToSection('/hoteles')}
              className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
            >
              <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
                Hospedaje
              </p>
              <p className='text-sm font-semibold'>Hoteles</p>
              <p className='text-[11px] text-slate-400 mt-1'>
                Descansá en los mejores alojamientos.
              </p>
            </button>

            {/* Shopping */}
            <button
              type='button'
              onClick={() => handleGoToSection('/shopping')}
              className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
            >
              <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
                Compras
              </p>
              <p className='text-sm font-semibold'>Shopping</p>
              <p className='text-[11px] text-slate-400 mt-1'>
                Centros comerciales y paseos de compras.
              </p>
            </button>

            {/* Eventos */}
            <button
              type='button'
              onClick={() => handleGoToSection('/eventos')}
              className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
            >
              <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
                Agenda
              </p>
              <p className='text-sm font-semibold'>Eventos</p>
              <p className='text-[11px] text-slate-400 mt-1'>
                Qué hacer hoy, mañana o el finde.
              </p>
            </button>

            {/* Bares */}
            <button
              type='button'
              onClick={() => handleGoToSection('/bares')}
              className='rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-4 text-left hover:border-emerald-500/60 hover:bg-slate-900 transition-colors'
            >
              <p className='text-[11px] font-semibold text-emerald-400 mb-1'>
                Noche
              </p>
              <p className='text-sm font-semibold'>Bares</p>
              <p className='text-[11px] text-slate-400 mt-1'>
                Cocktails, vino y buena música.
              </p>
            </button>
          </div>
        </section>
      </main>

      {/* Bottom navigation (usuario) */}
      <BottomNav />
    </div>
  )
}
