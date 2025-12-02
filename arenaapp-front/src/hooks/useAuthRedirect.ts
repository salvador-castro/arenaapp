// src/hooks/useAuthRedirect.ts
'use client'

import { useRouter, usePathname } from 'next/navigation'

export function useAuthRedirect (isLoggedIn: boolean) {
  const router = useRouter()
  const pathname = usePathname()

  const goTo = (targetPath: string) => {
    if (!isLoggedIn) {
      // página a la que quería ir (agenda, lugares, etc.)
      const redirectTo = targetPath || pathname
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`)
    } else {
      router.push(targetPath)
    }
  }

  return { goTo }
}
