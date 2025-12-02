// C:\Users\salvaCastro\Desktop\arenaapp-front\src\app\(private)\dashboard\page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import UserDropdown from '@/components/UserDropdown'
import { useAuth } from '@/context/AuthContext'

export default function DashboardPage () {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Dashboard: user =', user, 'isLoading =', isLoading)
    if (!isLoading && !user) {
      router.replace('/login?redirect=/dashboard')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-slate-950 text-slate-100'>
        Cargando...
      </main>
    )
  }

  if (!user) {
    // mientras redirige al login
    return null
  }

  return (
    <main className='min-h-screen flex flex-col bg-slate-950 text-slate-50'>
      <header className='flex items-center justify-between px-4 py-3 border-b border-slate-800'>
        <div>
          <p className='text-xs text-slate-400'>Bienvenido/a</p>
          <h1 className='text-lg font-semibold'>
            {user.nombre} {user.apellido}
          </h1>
        </div>

        <UserDropdown />
      </header>

      <section className='flex-1 px-4 py-4 space-y-4'>
        <div className='rounded-2xl border border-slate-800 bg-slate-900/60 p-4'>
          <h2 className='text-base font-semibold mb-1'>
            Qué bueno verte de nuevo, {user.nombre} {user.apellido}
          </h2>
          <p className='text-sm text-slate-300'>
            Desde acá vas a poder ver tus lugares favoritos, reservas, eventos y
            mucho más.
          </p>
        </div>
      </section>

      <BottomNav />
    </main>
  )
}
