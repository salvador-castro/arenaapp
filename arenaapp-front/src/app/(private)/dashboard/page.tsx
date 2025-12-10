'use client'

import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/BottomNav'
import TopNav from '@/components/TopNav'

export default function DashboardPage() {
  const { user, isLoading }: any = useAuth()
  const isLoggedIn = !isLoading && !!user
  const { goTo } = useAuthRedirect(isLoggedIn)

  const firstName = user?.nombre ?? user?.firstName ?? ''

  const handleGoToSection = (path: string) => {
    goTo(path)
  }

  return (
    <div className="min-h-screen pb-16 flex flex-col bg-slate-950">
      {/* NAVBAR SUPERIOR REUTILIZABLE */}
      <TopNav isLoggedIn={isLoggedIn} />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-3xl mx-auto px-4 pt-4 pb-4 space-y-6">
        {/* Saludo */}
        <header className="flex flex-col gap-1">
          <h1 className="text-lg md:text-xl font-medium text-slate-100">
            Bienvenido{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="text-xs text-slate-400">
            ¿Qué te gustaría explorar hoy?
          </p>
        </header>

        {/* Explorá por categoría */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">
            Explorá por categoría
          </h2>
          <p className="text-xs text-slate-400">
            Entrá directo a la sección que quieras descubrir.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Favoritos */}
            <button
              type="button"
              onClick={() => handleGoToSection('/favoritos')}
              className="relative rounded-xl overflow-hidden border border-emerald-500/50 hover:border-emerald-400 transition-colors bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/favoritos.png?v=2 ')",
              }}
            >
              {/* Overlay oscuro */}
              <div className="absolute inset-0 bg-slate-950/60" />

              {/* Contenido */}
              <div className="relative px-3 py-4 text-left">
                <p className="text-[11px] font-semibold text-emerald-300 mb-1">
                  Tus listas
                </p>
                <p className="text-sm font-semibold text-white">Favoritos</p>
                <p className="text-[11px] text-slate-200 mt-1">
                  Restaurantes, galerías y más que marcaste.
                </p>
              </div>
            </button>

            {/* Restaurantes */}
            <button
              type="button"
              onClick={() => handleGoToSection('/restaurantes')}
              className="relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/restaurantes.png?v=2 ')",
              }}
            >
              <div className="absolute inset-0 bg-slate-950/60" />
              <div className="relative px-3 py-4 text-left">
                <p className="text-[11px] font-semibold text-emerald-300 mb-1">
                  Comer
                </p>
                <p className="text-sm font-semibold text-white">Restaurantes</p>
                <p className="text-[11px] text-slate-200 mt-1">
                  Cocina local, internacional y más.
                </p>
              </div>
            </button>

            {/* Galerías */}
            <button
              type="button"
              onClick={() => handleGoToSection('/galerias')}
              className="relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/galerias.png?v=2 ')",
              }}
            >
              <div className="absolute inset-0 bg-slate-950/60" />
              <div className="relative px-3 py-4 text-left">
                <p className="text-[11px] font-semibold text-emerald-300 mb-1">
                  Arte
                </p>
                <p className="text-sm font-semibold text-white">Galerías</p>
                <p className="text-[11px] text-slate-200 mt-1">
                  Exhibiciones, muestras y cultura visual.
                </p>
              </div>
            </button>

            {/* Hoteles */}
            <button
              type="button"
              onClick={() => handleGoToSection('/hoteles')}
              className="relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/hoteles.png?v=2 ')",
              }}
            >
              <div className="absolute inset-0 bg-slate-950/60" />
              <div className="relative px-3 py-4 text-left">
                <p className="text-[11px] font-semibold text-emerald-300 mb-1">
                  Hospedaje
                </p>
                <p className="text-sm font-semibold text-white">Hoteles</p>
                <p className="text-[11px] text-slate-200 mt-1">
                  Descansá en los mejores alojamientos.
                </p>
              </div>
            </button>

            {/* Shopping */}
            <button
              type="button"
              onClick={() => handleGoToSection('/shopping')}
              className="relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/shopping.png?v=2 ')",
              }}
            >
              <div className="absolute inset-0 bg-slate-950/60" />
              <div className="relative px-3 py-4 text-left">
                <p className="text-[11px] font-semibold text-emerald-300 mb-1">
                  Compras
                </p>
                <p className="text-sm font-semibold text-white">Shopping</p>
                <p className="text-[11px] text-slate-200 mt-1">
                  Centros comerciales y paseos de compras.
                </p>
              </div>
            </button>

            {/* Eventos */}
            <button
              type="button"
              onClick={() => handleGoToSection('/eventos')}
              className="relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/eventos.png?v=2 ')",
              }}
            >
              <div className="absolute inset-0 bg-slate-950/60" />
              <div className="relative px-3 py-4 text-left">
                <p className="text-[11px] font-semibold text-emerald-300 mb-1">
                  Agenda
                </p>
                <p className="text-sm font-semibold text-white">Eventos</p>
                <p className="text-[11px] text-slate-200 mt-1">
                  Qué hacer hoy, mañana o el finde.
                </p>
              </div>
            </button>

            {/* Bares */}
            <button
              type="button"
              onClick={() => handleGoToSection('/bares')}
              className="relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-400 transition-colors bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/cardsDashboard/bars.png?v=2 ')",
              }}
            >
              <div className="absolute inset-0 bg-slate-950/60" />
              <div className="relative px-3 py-4 text-left">
                <p className="text-[11px] font-semibold text-emerald-300 mb-1">
                  Noche
                </p>
                <p className="text-sm font-semibold text-white">Bares</p>
                <p className="text-[11px] text-slate-200 mt-1">
                  Cocktails, vino y buena música.
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
