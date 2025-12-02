'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AuthGuard ({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Si después de cargar no hay usuario, mandamos al login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user, router])

  // Mientras carga o todavía no hay user, mostramos un loader
  if (isLoading || !user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='text-sm text-gray-500'>Cargando…</p>
      </div>
    )
  }

  return <>{children}</>
}
