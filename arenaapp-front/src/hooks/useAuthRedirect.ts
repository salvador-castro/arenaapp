'use client'

import { useRouter, usePathname } from 'next/navigation'

export function useAuthRedirect(isLoggedIn: boolean) {
  const router = useRouter()
  const pathname = usePathname()

  const goTo = (targetPath: string) => {
    // 🛑 1) Si ya viene una URL que arranca con /login, NO la envolvemos de nuevo
    if (targetPath.startsWith('/login')) {
      router.push(targetPath)
      return
    }

    if (!isLoggedIn) {
      // página real a la que quería ir (agenda, lugares, etc.)
      const redirectTo = targetPath || pathname || '/'
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`)
    } else {
      router.push(targetPath)
    }
  }

  return { goTo }
}
