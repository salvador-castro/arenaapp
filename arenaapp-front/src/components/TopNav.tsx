// /Users/salvacastro/Desktop/arenaapp/arenaapp-front/src/components/TopNav.tsx
'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import UserDropdown from '@/components/UserDropdown'

const LOGO_URL = 'https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/logo/logo.png?v=2'

type TopNavProps = {
  isLoggedIn: boolean
}

export default function TopNav({ isLoggedIn }: TopNavProps) {
  const pathname = usePathname()
  const { goTo } = useAuthRedirect(isLoggedIn)

  const isHome = pathname === '/'

  const handleLogoClick = () => {
    if (isLoggedIn) goTo('/dashboard')
    else goTo('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div
        className={`
          max-w-3xl mx-auto px-4 py-3 flex items-center
          ${isHome ? 'justify-center' : 'justify-between'}
        `}
      >
        {/* LOGO */}
        <button
          type="button"
          onClick={handleLogoClick}
          className={`flex items-center gap-2 focus:outline-none
            ${isHome ? 'mx-auto' : ''}
          `}
        >
          <Image
            src={LOGO_URL}
            alt="ArenaPress"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </button>

        {/* SOLO SE MUESTRA EL DROPDOWN SI NO ES HOME */}
        {!isHome && <UserDropdown />}
      </div>
    </header>
  )
}
